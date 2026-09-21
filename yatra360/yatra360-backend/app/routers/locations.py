from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..data.pune_locations import coords_for, grouped_locations, location_names
from ..services.routing import compare_routes, haversine_km

router = APIRouter(prefix="/api", tags=["locations"])


@router.get("/locations", response_model=List[schemas.LocationGroupOut])
def list_locations():
    """
    Every location the Transit & Routes dropdown can offer, grouped into
    optgroups (attractions, food, parks, transit hubs, neighbourhoods).
    """
    return grouped_locations()


@router.get("/locations/flat", response_model=List[str])
def list_location_names():
    """Flat name list, for autocomplete-style inputs."""
    return location_names()


def _resolve(name: str, db: Session):
    """
    Resolve a user-supplied string to coordinates.

    Tries the static Pune catalogue first, then falls back to the places
    table — that way an itinerary "Directions" link, which passes a place
    *id*, resolves just as well as a dropdown label.
    """
    coord = coords_for(name)
    if coord:
        return name, coord

    place = db.get(models.Place, name)
    if place is None:
        place = db.query(models.Place).filter(models.Place.name == name).first()
    if place and place.lat is not None:
        return place.name, (place.lat, place.lon)

    business = db.query(models.Business).filter(models.Business.name == name).first()
    if business and business.lat is not None:
        return business.name, (business.lat, business.lon)

    return None, None


@router.post("/routes/compare", response_model=schemas.RouteCompareOut)
def compare(payload: schemas.RouteCompareIn, db: Session = Depends(get_db)):
    """Compare travel options between two points, with map geometry for each."""
    origin_name, origin_coord = _resolve(payload.from_location, db)
    dest_name, dest_coord = _resolve(payload.destination, db)

    if not origin_coord:
        raise HTTPException(status_code=404, detail=f"We don't have coordinates for '{payload.from_location}' yet.")
    if not dest_coord:
        raise HTTPException(status_code=404, detail=f"We don't have coordinates for '{payload.destination}' yet.")
    if origin_coord == dest_coord:
        raise HTTPException(status_code=400, detail="Start and destination are the same place.")

    routes = compare_routes(origin_name, origin_coord, dest_name, dest_coord)

    return schemas.RouteCompareOut(
        origin=origin_name,
        destination=dest_name,
        origin_coordinates={"lat": origin_coord[0], "lon": origin_coord[1]},
        destination_coordinates={"lat": dest_coord[0], "lon": dest_coord[1]},
        distance_km=round(haversine_km(origin_coord, dest_coord), 2),
        routes=routes,
    )
