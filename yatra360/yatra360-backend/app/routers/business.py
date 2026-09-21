"""
The business side of the Yatra360 ecosystem.

Two surfaces live in this router:

  * /api/business/*  — the console a registered owner signs into
  * /api/local/*     — the public listings tourists browse

They share one `Business` table, which is the point: a cafe registers once
and appears in Locals' Favourites; a homestay registers once and appears in
the tourist hotel picker alongside the seeded listings.

Auth is a signed opaque token kept deliberately simple for the prototype.
Swap `_issue_token` / `current_business` for the Supabase JWT flow when
that lands — no endpoint signature changes.
"""

import hashlib
import hmac
import os
import secrets
import time
from typing import List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..data.pune_locations import coords_for
from ..services import intelligence
from ..utils import camelise

router = APIRouter(prefix="/api/business", tags=["business"])
public_router = APIRouter(prefix="/api/local", tags=["local-listings"])

SECRET = os.getenv("BUSINESS_TOKEN_SECRET", "yatra360-dev-secret-change-me")
TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7  # one week

BUSINESS_CATEGORIES = [
    "Café & restaurant",
    "Sweets & snacks",
    "Street food stall",
    "Hotel",
    "Homestay / guest house",
    "Guide & tour operator",
    "Artisan & handicrafts",
    "Retail & souvenirs",
    "Transport & rentals",
    "Experience & workshop",
]

# Which categories surface where on the tourist side.
STAY_CATEGORIES = ["Hotel", "Homestay / guest house"]
FOOD_CATEGORIES = ["Café & restaurant", "Sweets & snacks", "Street food stall"]


# --------------------------------------------------------------------------
# Password + token helpers
# --------------------------------------------------------------------------

def _hash_password(password: str, salt: Optional[str] = None) -> str:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120_000)
    return f"{salt}${digest.hex()}"


def _verify_password(password: str, stored: str) -> bool:
    try:
        salt, _ = stored.split("$", 1)
    except ValueError:
        return False
    return hmac.compare_digest(_hash_password(password, salt), stored)


def _issue_token(business_id: str) -> str:
    expiry = int(time.time()) + TOKEN_TTL_SECONDS
    payload = f"{business_id}:{expiry}"
    sig = hmac.new(SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()[:32]
    return f"{payload}:{sig}"


def _read_token(token: str) -> Optional[str]:
    try:
        business_id, expiry, sig = token.rsplit(":", 2)
    except ValueError:
        return None
    payload = f"{business_id}:{expiry}"
    expected = hmac.new(SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()[:32]
    if not hmac.compare_digest(sig, expected):
        return None
    if int(expiry) < time.time():
        return None
    return business_id


def current_business(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> models.Business:
    """FastAPI dependency: resolve the signed-in business or 401."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Sign in to your business account to see this.")
    business_id = _read_token(authorization.split(" ", 1)[1].strip())
    if not business_id:
        raise HTTPException(status_code=401, detail="Your session has expired. Please sign in again.")
    business = db.get(models.Business, business_id)
    if not business:
        raise HTTPException(status_code=401, detail="That business account no longer exists.")
    return business


# --------------------------------------------------------------------------
# Registration + sign-in
# --------------------------------------------------------------------------

@router.get("/categories", response_model=List[str])
def categories():
    return BUSINESS_CATEGORIES


@router.post("/register", response_model=schemas.BusinessSessionOut, status_code=201)
def register(payload: schemas.BusinessRegisterIn, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    if db.query(models.Business).filter(models.Business.email == email).first():
        raise HTTPException(status_code=409, detail="A business is already registered with that email.")
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Passwords need at least 8 characters.")

    coord = coords_for(payload.locality or "") or (18.5204, 73.8567)

    business = models.Business(
        name=payload.name.strip(),
        category=payload.category,
        email=email,
        password_hash=_hash_password(payload.password),
        phone=payload.phone,
        locality=payload.locality,
        address=payload.address,
        lat=coord[0],
        lon=coord[1],
        capacity=payload.capacity,
        capacity_unit=payload.capacity_unit,
        price_per_night=payload.price_per_night,
        price_band=payload.price_band,
        cuisine=payload.cuisine,
        signature_item=payload.signature_item,
        tagline=payload.tagline,
        hours=payload.hours,
        segments=payload.segments or [],
        image_url=payload.image_url,
    )
    db.add(business)
    db.commit()
    db.refresh(business)
    return schemas.BusinessSessionOut(token=_issue_token(business.id), business=business)


@router.post("/login", response_model=schemas.BusinessSessionOut)
def login(payload: schemas.BusinessLoginIn, db: Session = Depends(get_db)):
    business = db.query(models.Business).filter(
        models.Business.email == payload.email.strip().lower()
    ).first()
    if not business or not _verify_password(payload.password, business.password_hash):
        raise HTTPException(status_code=401, detail="That email and password don't match an account.")
    return schemas.BusinessSessionOut(token=_issue_token(business.id), business=business)


@router.get("/me", response_model=schemas.BusinessOut)
def me(business: models.Business = Depends(current_business)):
    return business


@router.patch("/me", response_model=schemas.BusinessOut)
def update_me(
    payload: schemas.BusinessUpdateIn,
    business: models.Business = Depends(current_business),
    db: Session = Depends(get_db),
):
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(business, field, value)
    if "locality" in data:
        coord = coords_for(data["locality"] or "")
        if coord:
            business.lat, business.lon = coord
    db.commit()
    db.refresh(business)
    return business


# --------------------------------------------------------------------------
# The crowd + opportunity dashboard
# --------------------------------------------------------------------------

@router.get("/dashboard")
def dashboard(
    radius_km: float = Query(2.5, ge=0.5, le=10),
    business: models.Business = Depends(current_business),
    db: Session = Depends(get_db),
):
    """
    Everything the console's overview needs in one call: nearby crowd
    levels, an hourly footfall forecast, generated opportunities and the
    live alert feed.
    """
    places = db.query(models.Place).all()
    attractions = intelligence.nearby_attractions(business, places, radius_km=radius_km)
    forecast = intelligence.footfall_forecast(attractions, business.capacity or 0)
    opportunities = intelligence.generate_opportunities(business, attractions, forecast)
    alerts = intelligence.generate_alerts(business, attractions, forecast)

    actioned = {
        a.opportunity_id: a.status
        for a in db.query(models.OpportunityAction)
        .filter(models.OpportunityAction.business_id == business.id)
        .all()
    }
    for opp in opportunities:
        opp["status"] = actioned.get(opp["id"])

    # These are assembled dicts rather than pydantic models, so they need
    # the snake_case -> camelCase pass the response models would have done.
    return camelise({
        "business": {
            "id": business.id,
            "name": business.name,
            "category": business.category,
            "locality": business.locality,
            "capacity": business.capacity,
            "capacity_unit": business.capacity_unit,
        },
        "radius_km": radius_km,
        "attractions": attractions,
        "forecast": forecast,
        "opportunities": opportunities,
        "alerts": alerts,
        "segments": intelligence.SEGMENTS,
    })


@router.get("/analytics")
def analytics(
    business: models.Business = Depends(current_business),
    db: Session = Depends(get_db),
):
    """Profile views over time, by source, and by hour — plus peak demand."""
    views = db.query(models.BusinessView).filter(
        models.BusinessView.business_id == business.id
    ).all()
    stats = intelligence.view_analytics(views)

    places = db.query(models.Place).all()
    attractions = intelligence.nearby_attractions(business, places)
    forecast = intelligence.footfall_forecast(attractions, business.capacity or 0)

    stats["peak_demand_window"] = forecast.get("peak_window")
    stats["projected_daily_footfall"] = forecast.get("total", 0)
    stats["reachable_at_peak"] = forecast.get("capture_estimate", 0)
    return camelise(stats)


@router.post("/opportunities/{opportunity_id}/{action}")
def act_on_opportunity(
    opportunity_id: str,
    action: str,
    business: models.Business = Depends(current_business),
    db: Session = Depends(get_db),
):
    if action not in {"accept", "dismiss"}:
        raise HTTPException(status_code=400, detail="Action must be 'accept' or 'dismiss'.")

    row = (
        db.query(models.OpportunityAction)
        .filter(
            models.OpportunityAction.business_id == business.id,
            models.OpportunityAction.opportunity_id == opportunity_id,
        )
        .first()
    )
    status = "accepted" if action == "accept" else "dismissed"
    if row:
        row.status = status
    else:
        db.add(models.OpportunityAction(
            business_id=business.id, opportunity_id=opportunity_id, status=status
        ))
    db.commit()
    return {"opportunityId": opportunity_id, "status": status}


@router.delete("/opportunities/{opportunity_id}")
def clear_opportunity(
    opportunity_id: str,
    business: models.Business = Depends(current_business),
    db: Session = Depends(get_db),
):
    db.query(models.OpportunityAction).filter(
        models.OpportunityAction.business_id == business.id,
        models.OpportunityAction.opportunity_id == opportunity_id,
    ).delete()
    db.commit()
    return {"opportunityId": opportunity_id, "status": None}


# --------------------------------------------------------------------------
# Public tourist-facing listings
# --------------------------------------------------------------------------

@public_router.get("/businesses", response_model=List[schemas.BusinessOut])
def list_businesses(
    category: Optional[str] = None,
    kind: Optional[str] = Query(None, description="'stay' or 'food' — shorthand for a category group"),
    locality: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Registered local businesses, for the tourist-facing sections."""
    query = db.query(models.Business).filter(models.Business.is_listed.is_(True))
    if category:
        query = query.filter(models.Business.category == category)
    if kind == "stay":
        query = query.filter(models.Business.category.in_(STAY_CATEGORIES))
    elif kind == "food":
        query = query.filter(models.Business.category.in_(FOOD_CATEGORIES))
    if locality:
        query = query.filter(models.Business.locality == locality)
    return query.order_by(models.Business.rating.desc()).all()


@public_router.get("/favourites", response_model=List[schemas.BusinessOut])
def locals_favourites(limit: int = 12, db: Session = Depends(get_db)):
    """Locals' Favourites — the food-and-drink slice of the registry."""
    return (
        db.query(models.Business)
        .filter(
            models.Business.is_listed.is_(True),
            models.Business.category.in_(FOOD_CATEGORIES),
        )
        .order_by(models.Business.rating.desc())
        .limit(limit)
        .all()
    )


@public_router.post("/businesses/{business_id}/view", status_code=204)
def record_view(
    business_id: str,
    source: str = Query("listing"),
    db: Session = Depends(get_db),
):
    """
    Records a profile impression. This is the tourist-side event that
    feeds the 'profile views' number in the business analytics tab.
    """
    if not db.get(models.Business, business_id):
        raise HTTPException(status_code=404, detail="Business not found")
    db.add(models.BusinessView(business_id=business_id, source=source))
    db.commit()
    return None
