import math
from typing import List

from sqlalchemy.orm import Session

from .. import models


def filter_places_for_profile(places: List[models.Place], profile, required_minimum: int = 1) -> List[models.Place]:
    """
    Filters places through a 3-tier fallback system. 
    It starts strict, relaxes to partial matches, and finally 
    defaults to the entire database to ensure long trips don't have empty days.
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

    # Tier 1: Try strict matching (must match BOTH interest and group type)
    filtered = [p for p in places if strict_match(p)]
    
    # Tier 2: If not enough places, relax to loose matching (must match AT LEAST ONE criteria)
    if len(filtered) < required_minimum:
        filtered = [p for p in places if loose_match(p)]
        
    # Tier 3: If STILL not enough places for a long vacation, use the entire database 
    # to guarantee the itinerary has as many stops as possible.
    if len(filtered) < required_minimum:
        filtered = places
        
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
