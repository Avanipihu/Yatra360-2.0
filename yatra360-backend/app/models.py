import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Float, Integer, Boolean, Date, DateTime, ForeignKey, JSON, Text
)
from sqlalchemy.orm import relationship

from .database import Base


def new_uuid():
    return str(uuid.uuid4())


class Place(Base):
    __tablename__ = "places"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    open_hours = Column(String)
    cost = Column(String)  # "Free" | "Low" | "Moderate" | "Premium"
    estimated_demand = Column(String, default="Moderate")  # Low | Moderate | High
    accessibility = Column(JSON, default=list)   # list[str]
    good_for = Column(JSON, default=list)        # list[str] group types
    description = Column(Text)
    source = Column(String)
    last_verified = Column(Date)

    route_options = relationship("RouteOption", back_populates="place")


class PlaceAlternative(Base):
    """Crowd-redistribution pairs: an overcrowded place mapped to a
    lower-demand alternative that offers a similar experience."""
    __tablename__ = "place_alternatives"

    id = Column(Integer, primary_key=True, autoincrement=True)
    overcrowded_id = Column(String, ForeignKey("places.id"), nullable=False)
    alternative_id = Column(String, ForeignKey("places.id"), nullable=False)
    shared_tag = Column(String)  # short human-readable reason they're comparable

    overcrowded = relationship("Place", foreign_keys=[overcrowded_id])
    alternative = relationship("Place", foreign_keys=[alternative_id])


class Hotel(Base):
    __tablename__ = "hotels"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    area = Column(String)
    price_per_night = Column(Integer)
    budget = Column(String)  # Low | Moderate | Premium
    rating = Column(Float)
    distance_to_center_km = Column(Float)
    source = Column(String)


class RouteOption(Base):
    """Mobility comparison rows. place_id = NULL means this is a generic
    fallback route used when no place-specific routing data exists yet."""
    __tablename__ = "route_options"

    id = Column(Integer, primary_key=True, autoincrement=True)
    place_id = Column(String, ForeignKey("places.id"), nullable=True)
    mode = Column(String, nullable=False)  # "Bus + Metro", "Auto + Walk", "Cab", "Walk"
    cost_inr = Column(Integer, default=0)
    time_min = Column(Integer, default=0)
    walking_m = Column(Integer, default=0)
    notes = Column(String)

    place = relationship("Place", back_populates="route_options")


class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(String, nullable=False)  # Police | Hospital | Ambulance | Women's Helpline | Tourist Helpline
    name = Column(String, nullable=False)
    number = Column(String, nullable=False)
    area = Column(String)
    source = Column(String)
    last_verified = Column(Date)


class ParkingSpot(Base):
    __tablename__ = "parking_spots"

    id = Column(String, primary_key=True)
    near = Column(String, nullable=False)
    availability = Column(String, default="Moderate")  # Low | Moderate | High
    note = Column(String)


class CityReport(Base):
    __tablename__ = "city_reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(String, nullable=False)  # Pothole | Waterlogging | ...
    location = Column(String, nullable=False)
    note = Column(String)
    has_photo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Trip(Base):
    """A generated trip profile + its saved itinerary. No user accounts
    are modeled here yet -- once the login/auth module exists, add a
    user_id foreign key here."""
    __tablename__ = "trips"

    id = Column(String, primary_key=True, default=new_uuid)
    destination = Column(String, default="Pune")
    start_date = Column(Date, nullable=True)
    days = Column(Integer, default=2)
    group_type = Column(String)
    budget = Column(String)
    interests = Column(JSON, default=list)
    mobility_pref = Column(String)
    accessibility = Column(JSON, default=list)
    needs_hotel = Column(Boolean, nullable=True)
    selected_hotel_id = Column(String, ForeignKey("hotels.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    stops = relationship("ItineraryStop", back_populates="trip", order_by="ItineraryStop.day_number, ItineraryStop.order_index")


class ItineraryStop(Base):
    __tablename__ = "itinerary_stops"

    id = Column(Integer, primary_key=True, autoincrement=True)
    trip_id = Column(String, ForeignKey("trips.id"), nullable=False)
    day_number = Column(Integer, nullable=False)
    order_index = Column(Integer, default=0)
    place_id = Column(String, ForeignKey("places.id"), nullable=False)

    trip = relationship("Trip", back_populates="stops")
    place = relationship("Place")
