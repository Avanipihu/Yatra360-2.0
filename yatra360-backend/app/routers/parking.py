from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/parking", tags=["parking"])


@router.get("", response_model=List[schemas.ParkingSpotOut])
def list_parking(db: Session = Depends(get_db)):
    return db.query(models.ParkingSpot).all()
