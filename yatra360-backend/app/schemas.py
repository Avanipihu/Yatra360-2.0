from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, alias_generators


class CamelModel(BaseModel):
    """Base model that serializes fields as camelCase, matching the shape
    the React frontend's mockData.js already uses -- so switching from
    mock data to this API needs no frontend field-name changes."""
    model_config = ConfigDict(
        alias_generator=alias_generators.to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


# ---------- Places ----------

class PlaceOut(CamelModel):
    id: str
    name: str
    category: str
    lat: float
    lon: float
    open_hours: Optional[str] = None
    cost: Optional[str] = None
    estimated_demand: str = "Moderate"
    accessibility: List[str] = []
    good_for: List[str] = []
    description: Optional[str] = None
    source: Optional[str] = None
    last_verified: Optional[date] = None


class AlternativePairOut(CamelModel):
    overcrowded: PlaceOut
    alternative: PlaceOut
    shared_tag: str


# ---------- Hotels ----------

class HotelOut(CamelModel):
    id: str
    name: str
    area: Optional[str] = None
    price_per_night: int
    budget: str
    rating: Optional[float] = None
    distance_to_center_km: Optional[float] = None
    source: Optional[str] = None


# ---------- Route options ----------

class RouteOptionOut(CamelModel):
    mode: str
    cost_inr: int
    time_min: int
    walking_m: int
    notes: Optional[str] = None


# ---------- Safety / weather ----------

class EmergencyContactOut(CamelModel):
    type: str
    name: str
    number: str
    area: Optional[str] = None
    source: Optional[str] = None
    last_verified: Optional[date] = None


class WeatherOut(CamelModel):
    location: str
    condition: str
    temp_c: float
    humidity: int
    advisory: str
    source: str = "Sample data (IMD/weather API integration pending)"


# ---------- Parking / reports ----------

class ParkingSpotOut(CamelModel):
    id: str
    near: str
    availability: str
    note: Optional[str] = None


class CityReportIn(CamelModel):
    type: str
    location: str
    note: Optional[str] = None
    has_photo: bool = False


class CityReportOut(CityReportIn):
    id: int
    created_at: datetime


# ---------- Trip / itinerary ----------

class TripProfileIn(CamelModel):
    destination: str = "Pune"
    start_date: Optional[date] = None
    days: int = 2
    group_type: str = "Family"
    budget: str = "Moderate"
    interests: List[str] = []
    mobility_pref: str = "Mixed"
    accessibility: List[str] = []
    needs_hotel: Optional[bool] = None
    selected_hotel_id: Optional[str] = None


class ItineraryDayOut(CamelModel):
    day_number: int
    stops: List[PlaceOut]


class TripOut(CamelModel):
    id: str
    destination: str
    start_date: Optional[date] = None
    days: int
    group_type: str
    budget: str
    interests: List[str]
    mobility_pref: str
    accessibility: List[str]
    needs_hotel: Optional[bool] = None
    selected_hotel_id: Optional[str] = None
    itinerary: List[ItineraryDayOut]
