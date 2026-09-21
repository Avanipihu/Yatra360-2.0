from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/hotels", tags=["hotels"])

STAY_CATEGORIES = ["Hotel", "Homestay / guest house"]

# A registered stay without a nightly rate still needs to sort sensibly
# against the seeded listings, so each band gets a representative price.
BAND_FALLBACK_PRICE = {"Low": 1200, "Moderate": 2800, "Premium": 6000}


def _business_as_hotel(b: models.Business) -> schemas.HotelOut:
    """Present a registered local stay in the same shape as a seeded hotel."""
    return schemas.HotelOut(
        id=f"biz-{b.id}",
        name=b.name,
        area=b.locality,
        price_per_night=b.price_per_night or BAND_FALLBACK_PRICE.get(b.price_band, 2500),
        budget=b.price_band or "Moderate",
        rating=b.rating,
        distance_to_center_km=None,
        source="Registered on Yatra360 by the owner",
        is_local=True,
        category=b.category,
        tagline=b.tagline,
        image_url=b.image_url,
        capacity=b.capacity,
        capacity_unit=b.capacity_unit,
    )


@router.get("", response_model=List[schemas.HotelOut])
def list_hotels(budget: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Stay options for the tourist picker.

    Locally-registered homestays and small hotels are merged in alongside
    the seeded listings and sorted first, so an authentic local option is
    what a visitor sees before a chain.
    """
    seeded_q = db.query(models.Hotel)
    if budget:
        seeded_q = seeded_q.filter(models.Hotel.budget == budget)
    seeded = seeded_q.all()

    local_q = db.query(models.Business).filter(
        models.Business.is_listed.is_(True),
        models.Business.category.in_(STAY_CATEGORIES),
    )
    if budget:
        local_q = local_q.filter(models.Business.price_band == budget)
    local = local_q.all()

    # Never show an empty picker: if nothing matches the budget, fall back
    # to the full list rather than leaving the user stuck.
    if budget and not seeded and not local:
        seeded = db.query(models.Hotel).all()
        local = db.query(models.Business).filter(
            models.Business.is_listed.is_(True),
            models.Business.category.in_(STAY_CATEGORIES),
        ).all()

    out = [_business_as_hotel(b) for b in local]
    out += [
        schemas.HotelOut.model_validate(h).model_copy(update={"is_local": False})
        for h in seeded
    ]
    return out
