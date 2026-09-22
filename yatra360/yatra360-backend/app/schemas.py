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
    image_url: Optional[str] = None
    image_credit: Optional[str] = None
    locality: Optional[str] = None


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
    # Set when this listing came from a business that registered itself,
    # so the tourist UI can mark it as a local, owner-run option.
    is_local: bool = False
    category: Optional[str] = None
    tagline: Optional[str] = None
    image_url: Optional[str] = None
    capacity: Optional[int] = None
    capacity_unit: Optional[str] = None


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
    accessibility: List[str] = []
    needs_hotel: Optional[bool] = None
    selected_hotel_id: Optional[str] = None
    itinerary: List[ItineraryDayOut]


# ---------- Locations / routing ----------

class LocationOut(CamelModel):
    name: str
    lat: float
    lon: float


class LocationGroupOut(CamelModel):
    group: str
    locations: List[LocationOut]


class RouteCompareIn(CamelModel):
    from_location: str
    destination: str


class CoordOut(CamelModel):
    lat: float
    lon: float


class StationOut(CamelModel):
    name: str
    lat: float
    lon: float


class RouteLegOut(CamelModel):
    type: str
    cost: int
    time: int
    walking: int
    description: Optional[str] = None
    geometry: Optional[List[List[float]]] = None
    first_leg_geometry: Optional[List[List[float]]] = None
    metro_geometry: Optional[List[List[float]]] = None
    last_leg_geometry: Optional[List[List[float]]] = None
    stations: Optional[List[StationOut]] = None


class RouteCompareOut(CamelModel):
    """`origin` rather than `from`, which is a reserved word in Python and
    would need an awkward alias on both sides of the wire."""
    origin: str
    destination: str
    origin_coordinates: CoordOut
    destination_coordinates: CoordOut
    distance_km: float
    routes: List[RouteLegOut]


# ---------- Businesses ----------

class BusinessRegisterIn(CamelModel):
    name: str
    category: str
    email: str
    password: str
    phone: Optional[str] = None
    locality: Optional[str] = None
    address: Optional[str] = None
    capacity: int = 0
    capacity_unit: str = "seats"
    price_per_night: Optional[int] = None
    price_band: str = "Moderate"
    cuisine: Optional[str] = None
    signature_item: Optional[str] = None
    tagline: Optional[str] = None
    hours: str = "09:00-22:00"
    segments: List[str] = []
    image_url: Optional[str] = None


class BusinessLoginIn(CamelModel):
    email: str
    password: str


class BusinessOut(CamelModel):
    id: str
    name: str
    category: str
    email: str
    phone: Optional[str] = None
    locality: Optional[str] = None
    address: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    capacity: int = 0
    capacity_unit: str = "seats"
    price_per_night: Optional[int] = None
    price_band: str = "Moderate"
    cuisine: Optional[str] = None
    signature_item: Optional[str] = None
    tagline: Optional[str] = None
    hours: Optional[str] = None
    segments: List[str] = []
    image_url: Optional[str] = None
    rating: Optional[float] = None
    is_listed: bool = True
    is_verified: bool = False


class BusinessSessionOut(CamelModel):
    token: str
    business: BusinessOut


class BusinessUpdateIn(CamelModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    locality: Optional[str] = None
    address: Optional[str] = None
    capacity: Optional[int] = None
    capacity_unit: Optional[str] = None
    price_per_night: Optional[int] = None
    price_band: Optional[str] = None
    cuisine: Optional[str] = None
    signature_item: Optional[str] = None
    tagline: Optional[str] = None
    hours: Optional[str] = None
    segments: Optional[List[str]] = None
    image_url: Optional[str] = None
    is_listed: Optional[bool] = None
