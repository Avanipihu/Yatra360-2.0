import math
from typing import List

from sqlalchemy.orm import Session

from .. import models


def filter_places_for_profile(places: List[models.Place], profile) -> List[models.Place]:
    """Mirrors the filtering logic in the frontend's TripContext.jsx
    buildItinerary(): match on interests (category) and group type, and
    fall back to the full pool if nothing matches so the itinerary is
    never empty."""
    def matches(place: models.Place) -> bool:
        interest_match = (not profile.interests) or (place.category in profile.interests)
        good_for = place.good_for or []
        group_match = (not good_for) or (profile.group_type in good_for)
        return interest_match and group_match

    filtered = [p for p in places if matches(p)]
    return filtered if filtered else places


def build_itinerary(places: List[models.Place], days: int) -> List[List[models.Place]]:
    """Splits the filtered place pool evenly across the number of days."""
    if not places or days < 1:
        return []
    per_day = max(1, math.ceil(len(places) / days))
    day_groups = []
    for d in range(days):
        chunk = places[d * per_day: d * per_day + per_day]
        if chunk:
            day_groups.append(chunk)
    return day_groups
