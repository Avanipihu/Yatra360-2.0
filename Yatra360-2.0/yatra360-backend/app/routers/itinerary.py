from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..services.recommendation import filter_places_for_profile, build_itinerary

router = APIRouter(prefix="/api/itinerary", tags=["itinerary"])


@router.post("/generate", response_model=schemas.TripOut)
def generate_itinerary(profile: schemas.TripProfileIn, db: Session = Depends(get_db)):
    all_places = db.query(models.Place).all()
    if not all_places:
        raise HTTPException(status_code=503, detail="No place data available yet")

    filtered = filter_places_for_profile(all_places, profile)
    day_groups = build_itinerary(filtered, profile.days)

    trip = models.Trip(
        destination=profile.destination,
        start_date=profile.start_date,
        days=profile.days,
        group_type=profile.group_type,
        budget=profile.budget,
        interests=profile.interests,
        mobility_pref=profile.mobility_pref,
        accessibility=profile.accessibility,
        needs_hotel=profile.needs_hotel,
        selected_hotel_id=profile.selected_hotel_id,
    )
    db.add(trip)
    db.flush()  # assign trip.id before creating stops

    for day_number, stops in enumerate(day_groups, start=1):
        for order_index, place in enumerate(stops):
            db.add(models.ItineraryStop(
                trip_id=trip.id, day_number=day_number,
                order_index=order_index, place_id=place.id,
            ))
    db.commit()
    db.refresh(trip)

    return _trip_to_out(trip)


@router.get("/{trip_id}", response_model=schemas.TripOut)
def get_trip(trip_id: str, db: Session = Depends(get_db)):
    trip = db.get(models.Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return _trip_to_out(trip)


def _trip_to_out(trip: models.Trip) -> schemas.TripOut:
    days = {}
    for stop in trip.stops:
        days.setdefault(stop.day_number, []).append(stop.place)

    itinerary = [
        schemas.ItineraryDayOut(day_number=day_number, stops=places)
        for day_number, places in sorted(days.items())
    ]

    return schemas.TripOut(
        id=trip.id,
        destination=trip.destination,
        start_date=trip.start_date,
        days=trip.days,
        group_type=trip.group_type,
        budget=trip.budget,
        interests=trip.interests or [],
        mobility_pref=trip.mobility_pref,
        accessibility=trip.accessibility or [],
        needs_hotel=trip.needs_hotel,
        selected_hotel_id=trip.selected_hotel_id,
        itinerary=itinerary,
    )
