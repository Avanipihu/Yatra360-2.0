import math
from typing import List

from sqlalchemy.orm import Session

from .. import models


def filter_places_for_profile(places: List[models.Place], profile, required_minimum: int = 1) -> List[models.Place]:
    """
    Filters places by interests and group type. If the strict match yields 
    too few results for the trip length, it relaxes to a partial match.
    """
    def strict_match(place: models.Place) -> bool:
        interest_match = (not profile.interests) or (place.category in profile.interests)
        good_for = place.good_for or []
        group_match = (not good_for) or (profile.group_type in good_for)
        return interest_match and group_match

    def loose_match(place: models.Place) -> bool:
        interest_match = (not profile.interests) or (place.category in profile.interests)
        good_for = place.good_for or []
        group_match = (not good_for) or (profile.group_type in good_for)
        return interest_match or group_match

    filtered = [p for p in places if strict_match(p)]
    
    if len(filtered) < required_minimum:
        filtered = [p for p in places if loose_match(p)]
        
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
