from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/mobility", tags=["mobility"])


@router.get("/routes", response_model=List[schemas.RouteOptionOut])
def get_routes(to: Optional[str] = None, db: Session = Depends(get_db)):
    """Route comparison for a destination place. Falls back to the
    generic (place_id=None) options if the place has no specific routing
    data yet -- swap this for a real routing engine/API later."""
    options = []
    if to:
        options = db.query(models.RouteOption).filter(models.RouteOption.place_id == to).all()
    if not options:
        options = db.query(models.RouteOption).filter(models.RouteOption.place_id.is_(None)).all()
    return options
