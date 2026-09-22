from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import math

from .. import models, schemas
from ..database import get_db
from ..services.routing import compare_routes
from ..data.pune_locations import coords_for

router = APIRouter(prefix="/api/mobility", tags=["mobility"])

class RouteCompareIn(BaseModel):
    fromLocation: str
    destination: str

@router.get("/routes", response_model=List[schemas.RouteOptionOut])
def get_routes(to: Optional[str] = None, db: Session = Depends(get_db)):
    options = []
    if to:
        options = db.query(models.RouteOption).filter(models.RouteOption.place_id == to).all()
    if not options:
        options = db.query(models.RouteOption).filter(models.RouteOption.place_id.is_(None)).all()
    return options

@router.post("/routes/compare")
def compare_mobility_routes(req: RouteCompareIn):
    from_coord = coords_for(req.fromLocation)
    to_coord = coords_for(req.destination)
    if not from_coord or not to_coord:
        raise HTTPException(
            status_code=404, 
            detail=f"Could not resolve coordinates for '{req.fromLocation}' or '{req.destination}'."
        )
    
    r = 6371.0
    lat1, lon1 = math.radians(from_coord[0]), math.radians(from_coord)
    lat2, lon2 = math.radians(to_coord[0]), math.radians(to_coord)
    dlat, dlon = lat2 - lat1, lon2 - lon1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    distance_km = round(2 * r * math.asin(math.sqrt(h)), 2)

    routes = compare_routes(req.fromLocation, from_coord, req.destination, to_coord)
    return {
        "origin": req.fromLocation,
        "originCoordinates": {"lat": from_coord[0], "lon": from_coord},
        "destination": req.destination,
        "destinationCoordinates": {"lat": to_coord[0], "lon": to_coord},
        "distanceKm": distance_km,
        "routes": routes
    }
