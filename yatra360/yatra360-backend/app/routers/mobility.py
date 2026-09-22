from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..services.routing import compare_routes


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/api/mobility",
    tags=["mobility"],
)


# =========================================================
# REQUEST MODEL
# =========================================================

class RouteCompareRequest(BaseModel):
    """
    Request body for Smart Mobility route comparison.

    The frontend currently sends:
        {
            "fromLocation": "...",
            "destination": "..."
        }
    """

    fromLocation: str = Field(
        ...,
        min_length=1,
        description="Starting location in Pune",
    )

    destination: str = Field(
        ...,
        min_length=1,
        description="Destination in Pune",
    )


# =========================================================
# EXISTING DATABASE ROUTES
# =========================================================

@router.get(
    "/routes",
    response_model=List[schemas.RouteOptionOut],
)
def get_routes(
    to: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Return stored route options for a destination.

    This endpoint is kept for compatibility with the rest
    of the Yatra360 backend.
    """

    options = []

    if to:
        options = (
            db.query(models.RouteOption)
            .filter(models.RouteOption.place_id == to)
            .all()
        )

    if not options:
        options = (
            db.query(models.RouteOption)
            .filter(models.RouteOption.place_id.is_(None))
            .all()
        )

    return options


# =========================================================
# SMART MOBILITY — ROUTE COMPARISON
# =========================================================

@router.post("/../routes/compare")
def compare_route_options(
    request: RouteCompareRequest,
):
    """
    Compare multiple transport options between two Pune locations.

    This endpoint is used by the Smart Mobility frontend.

    Flow:

        Frontend
            ↓
        /api/routes/compare
            ↓
        routing.py
            ↓
        route comparison engine
            ↓
        route geometry + cost + time + walking
    """

    from_location = request.fromLocation.strip()
    destination = request.destination.strip()

    # -----------------------------------------------------
    # Validate input
    # -----------------------------------------------------

    if not from_location:
        raise HTTPException(
            status_code=400,
            detail="Starting point is required.",
        )

    if not destination:
        raise HTTPException(
            status_code=400,
            detail="Destination is required.",
        )

    # -----------------------------------------------------
    # Geocode locations
    #
    # The routing service expects coordinates.
    # We use the existing Pune location data first and
    # fall back to OpenStreetMap Nominatim.
    # -----------------------------------------------------

    origin = _geocode_location(from_location)

    if origin is None:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Could not locate '{from_location}' "
                f"in Pune."
            ),
        )

    destination_point = _geocode_location(destination)

    if destination_point is None:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Could not locate '{destination}' "
                f"in Pune."
            ),
        )

    # -----------------------------------------------------
    # Call the existing routing service
    # -----------------------------------------------------

    try:
        routes = compare_routes(
            from_name=from_location,
            from_coord=(
                origin["lat"],
                origin["lon"],
            ),
            to_name=destination,
            to_coord=(
                destination_point["lat"],
                destination_point["lon"],
            ),
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "The Smart Mobility routing service "
                "could not calculate the routes."
            ),
        ) from exc

    # -----------------------------------------------------
    # Add simple route badges
    # -----------------------------------------------------

    if routes:

        fastest_route = min(
            routes,
            key=lambda route: route.get(
                "time",
                float("inf"),
            ),
        )

        cheapest_route = min(
            routes,
            key=lambda route: route.get(
                "cost",
                float("inf"),
            ),
        )

        for route in routes:

            route["badge"] = ""

            if route is fastest_route:
                route["badge"] = "Fastest"

            if route is cheapest_route:

                if route["badge"]:
                    route["badge"] = (
                        f'{route["badge"]} · Cheapest'
                    )
                else:
                    route["badge"] = "Cheapest"

    # -----------------------------------------------------
    # Final response
    # -----------------------------------------------------

    return {
        "from": from_location,
        "destination": destination,

        "from_coordinates": {
            "lat": origin["lat"],
            "lon": origin["lon"],
        },

        "destination_coordinates": {
            "lat": destination_point["lat"],
            "lon": destination_point["lon"],
        },

        "routes": routes,
    }


# =========================================================
# GEOCODING
# =========================================================

def _geocode_location(location: str):
    """
    Convert a Pune location name into latitude/longitude.

    First checks a small set of reliable locations used by
    the Smart Mobility prototype.

    If the location is not found there, it falls back to
    OpenStreetMap Nominatim.

    Returns:

        {
            "lat": float,
            "lon": float,
            "display_name": str
        }

    or None if the location cannot be found.
    """

    # -----------------------------------------------------
    # Prototype locations
    # -----------------------------------------------------

    known_locations = {
        "shivajinagar": (
            18.5308,
            73.8475,
        ),

        "shivaji nagar": (
            18.5308,
            73.8475,
        ),

        "aga khan palace": (
            18.5523,
            73.9010,
        ),

        "shaniwar wada": (
            18.5195,
            73.8553,
        ),

        "pune railway station": (
            18.5285,
            73.8743,
        ),

        "pune junction": (
            18.5285,
            73.8743,
        ),

        "koregaon park": (
            18.5362,
            73.8937,
        ),

        "yerawada": (
            18.5510,
            73.8770,
        ),

        "deccan": (
            18.5167,
            73.8410,
        ),

        "swargate": (
            18.5018,
            73.8636,
        ),

        "hadapsar": (
            18.5089,
            73.9260,
        ),

        "kothrud": (
            18.5074,
            73.8077,
        ),

        "camp": (
            18.5122,
            73.8799,
        ),
    }

    cleaned = location.strip().lower()

    if cleaned in known_locations:

        lat, lon = known_locations[cleaned]

        return {
            "lat": lat,
            "lon": lon,
            "display_name": location,
        }

    # -----------------------------------------------------
    # OpenStreetMap Nominatim fallback
    # -----------------------------------------------------

    try:
        import json
        import urllib.parse
        import urllib.request

        query = urllib.parse.quote(
            f"{location}, Pune, Maharashtra, India"
        )

        url = (
            "https://nominatim.openstreetmap.org/search"
            f"?q={query}"
            "&format=json"
            "&limit=1"
        )

        request = urllib.request.Request(
            url,
            headers={
                "User-Agent": (
                    "Yatra360-Smart-Mobility-Prototype/1.0"
                )
            },
        )

        with urllib.request.urlopen(
            request,
            timeout=10,
        ) as response:

            result = json.loads(
                response.read().decode("utf-8")
            )

        if (
            isinstance(result, list)
            and len(result) > 0
        ):

            item = result[0]

            return {
                "lat": float(item["lat"]),
                "lon": float(item["lon"]),
                "display_name": item.get(
                    "display_name",
                    location,
                ),
            }

    except Exception:
        return None

    return None
