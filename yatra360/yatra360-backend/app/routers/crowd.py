from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..schemas import CamelModel

router = APIRouter(prefix="/api/crowd", tags=["crowd"])


class PlaceIdsIn(CamelModel):
    place_ids: List[str]


@router.post("/alternatives", response_model=List[schemas.AlternativePairOut])
def get_alternatives(payload: PlaceIdsIn, db: Session = Depends(get_db)):
    """Given the place ids currently in a tourist's itinerary, return any
    overcrowded -> lower-demand-alternative pairs that apply."""
    pairs = (
        db.query(models.PlaceAlternative)
        .filter(models.PlaceAlternative.overcrowded_id.in_(payload.place_ids))
        .all()
    )
    return [
        schemas.AlternativePairOut(
            overcrowded=pair.overcrowded,
            alternative=pair.alternative,
            shared_tag=pair.shared_tag,
        )
        for pair in pairs
    ]


@router.get("/alternatives/trip/{trip_id}", response_model=List[schemas.AlternativePairOut])
def get_alternatives_for_trip(trip_id: str, db: Session = Depends(get_db)):
    trip = db.get(models.Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    place_ids = [stop.place_id for stop in trip.stops]
    pairs = (
        db.query(models.PlaceAlternative)
        .filter(models.PlaceAlternative.overcrowded_id.in_(place_ids))
        .all()
    )
    return [
        schemas.AlternativePairOut(
            overcrowded=pair.overcrowded,
            alternative=pair.alternative,
            shared_tag=pair.shared_tag,
        )
        for pair in pairs
    ]
