from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/places", tags=["places"])


@router.get("", response_model=List[schemas.PlaceOut])
def list_places(
    category: Optional[str] = None,
    group_type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Place)
    if category:
        query = query.filter(models.Place.category == category)
    places = query.all()
    if group_type:
        places = [p for p in places if not p.good_for or group_type in p.good_for]
    return places


@router.get("/{place_id}", response_model=schemas.PlaceOut)
def get_place(place_id: str, db: Session = Depends(get_db)):
    place = db.get(models.Place, place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    return place
