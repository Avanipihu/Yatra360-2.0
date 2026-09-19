from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/hotels", tags=["hotels"])


@router.get("", response_model=List[schemas.HotelOut])
def list_hotels(budget: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Hotel)
    if budget:
        query = query.filter(models.Hotel.budget == budget)
    hotels = query.all()
    # Fall back to the full list if nothing matches the requested budget,
    # so the frontend's hotel picker is never empty.
    if budget and not hotels:
        hotels = db.query(models.Hotel).all()
    return hotels
