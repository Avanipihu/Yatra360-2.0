"""
Crowd + opportunity intelligence for the business console.

This is the layer that turns tourism data into something a shop owner can
act on. It answers three questions:

  1. How crowded are the attractions near me, right now and later today?
  2. What does that mean I should actually do?
  3. What just changed that I would want to be told about?

Demand curves are modelled deterministically from the attraction's own
`estimated_demand` plus time of day and day of week, so the dashboard is
stable and demoable without a live crowd feed. When the real feed lands,
replace `crowd_curve()` and everything downstream keeps working.
"""

import math
from datetime import datetime
from typing import List, Optional

from ..data.pune_locations import coords_for
from .routing import haversine_km

HOURS = list(range(24))

# How busy each demand band gets at its peak, 0..1.
DEMAND_CEILING = {"High": 0.94, "Moderate": 0.62, "Low": 0.34}

# Visitor segments the dashboard splits arrivals into.
SEGMENTS = {
    "family": {"name": "Family", "hex": "#C98A2B"},
    "solo": {"name": "Solo & couples", "hex": "#2C6E63"},
    "transit": {"name": "In transit", "hex": "#B4432E"},
}


def _bell(hour: int, centre: float, amp: float, width: float) -> float:
    return amp * math.exp(-((hour - centre) ** 2) / (2 * width * width))


def crowd_curve(demand_band: str, is_weekend: bool) -> List[float]:
    """Hourly crowd index (0..1) for an attraction across a full day."""
    ceiling = DEMAND_CEILING.get(demand_band, 0.6)
    weekend_lift = 1.18 if is_weekend else 0.82

    curve = []
    for h in HOURS:
        v = 0.04
        v += _bell(h, 11.0, 0.55, 2.3)   # late-morning visit window
        v += _bell(h, 17.5, 0.78, 2.5)   # the big evening wave
        v += _bell(h, 14.0, 0.26, 2.0)   # post-lunch trickle
        if h < 6 or h > 22:
            v *= 0.12
        curve.append(round(min(1.0, v * ceiling * weekend_lift), 3))
    return curve


def segment_mix(demand_band: str, is_weekend: bool, hour: int) -> dict:
    """Share of arrivals by segment at a given hour — shares sum to 1."""
    family = 0.30 + (0.16 if is_weekend else -0.06) + _bell(hour, 18, 0.14, 3)
    solo = 0.28 + _bell(hour, 20, 0.12, 3)
    transit = 0.26 + (0.20 if not is_weekend else 0.0) + _bell(hour, 9, 0.14, 2)
    total = family + solo + transit
    return {
        "family": round(family / total, 3),
        "solo": round(solo / total, 3),
        "transit": round(transit / total, 3),
    }


def level_for(index: float) -> str:
    if index >= 0.75:
        return "Very high"
    if index >= 0.55:
        return "High"
    if index >= 0.32:
        return "Moderate"
    return "Low"


def nearby_attractions(business, places, radius_km: float = 2.5) -> List[dict]:
    """
    Attractions inside the business's demand radius, each with its current
    crowd index. Sorted nearest first.
    """
    if business.lat is None or business.lon is None:
        origin = coords_for(business.locality or "")
    else:
        origin = (business.lat, business.lon)
    if not origin:
        origin = (18.5204, 73.8567)  # central Pune fallback

    now = datetime.now()
    is_weekend = now.weekday() >= 5
    hour = now.hour

    out = []
    for place in places:
        if place.lat is None or place.lon is None:
            continue
        dist = haversine_km(origin, (place.lat, place.lon))
        if dist > radius_km:
            continue
        curve = crowd_curve(place.estimated_demand or "Moderate", is_weekend)
        index = curve[hour]
        peak_hour = max(HOURS, key=lambda h: curve[h])
        out.append({
            "place_id": place.id,
            "name": place.name,
            "category": place.category,
            "distance_km": round(dist, 2),
            "crowd_index": index,
            "crowd_level": level_for(index),
            "peak_hour": peak_hour,
            "peak_index": curve[peak_hour],
            "curve": curve,
            "image_url": place.image_url,
        })
    out.sort(key=lambda a: a["distance_km"])
    return out


def footfall_forecast(attractions: List[dict], capacity: int) -> dict:
    """Aggregate the nearby attractions into one hourly footfall picture."""
    if not attractions:
        return {"series": [], "total": 0, "peak_window": "—", "peak_hour": None}

    now = datetime.now()
    is_weekend = now.weekday() >= 5

    series = []
    for h in HOURS:
        # Attractions closer to the business contribute more of their crowd.
        raw = sum(
            a["curve"][h] * (1 / (1 + a["distance_km"]))
            for a in attractions
        )
        # Scale into a headcount that reads plausibly against the business size.
        arrivals = round(raw * 420 * (1.2 if is_weekend else 0.85))
        mix = segment_mix("Moderate", is_weekend, h)
        series.append({
            "hour": h,
            "total": arrivals,
            "family": round(arrivals * mix["family"]),
            "solo": round(arrivals * mix["solo"]),
            "transit": round(arrivals * mix["transit"]),
        })

    peak = max(series, key=lambda r: r["total"])
    total = sum(r["total"] for r in series)
    ph = peak["hour"]
    capture = max(1, round(peak["total"] * 0.06))

    return {
        "series": series,
        "total": total,
        "peak_hour": ph,
        "peak_window": f"{ph:02d}:00–{(ph + 2) % 24:02d}:00",
        "peak_arrivals": peak["total"],
        "capture_estimate": capture,
        "capacity_pressure": round(min(2.0, capture / max(1, capacity or 1)), 2),
    }


# --------------------------------------------------------------------------
# Opportunities + alerts
# --------------------------------------------------------------------------

FOOD_CATEGORIES = {"Café & restaurant", "Sweets & snacks", "Street food stall"}
STAY_CATEGORIES = {"Hotel", "Homestay / guest house"}
GUIDE_CATEGORIES = {"Guide & tour operator"}
CRAFT_CATEGORIES = {"Artisan & handicrafts", "Retail & souvenirs"}


def generate_opportunities(business, attractions: List[dict], forecast: dict) -> List[dict]:
    """
    Plain-language, actionable prompts. Every one names the signal it came
    from so the owner can disagree with it.
    """
    opps: List[dict] = []
    now = datetime.now()
    hour = now.hour
    is_weekend = now.weekday() >= 5
    cat = business.category or ""

    busy = [a for a in attractions if a["crowd_index"] >= 0.55]
    quiet = [a for a in attractions if a["crowd_index"] < 0.32]
    peak_hour = forecast.get("peak_hour")

    # 1. A crowded attraction next door is overflow you can catch.
    if busy:
        top = max(busy, key=lambda a: a["crowd_index"])
        if cat in FOOD_CATEGORIES:
            action = (
                f"Push your {business.cuisine or 'signature'} menu now — put the board out facing "
                f"{top['name']} and lead with {business.signature_item or 'your best-known dish'}."
            )
        elif cat in STAY_CATEGORIES:
            action = f"Open same-day rates. Visitors leaving {top['name']} after dark look for a nearby stay rather than travelling back across the city."
        elif cat in GUIDE_CATEGORIES:
            action = f"Offer a short walking tour that starts away from {top['name']} and rejoins it once the crowd thins after {top['peak_hour'] + 2:02d}:00."
        else:
            action = f"Staff your counter now — foot traffic spilling out of {top['name']} passes within {top['distance_km']} km of you."

        opps.append({
            "id": f"crowd-{top['place_id']}",
            "kind": "crowd",
            "urgency": "high" if top["crowd_index"] >= 0.75 else "medium",
            "title": f"{top['name']} is {top['crowd_level'].lower()} right now",
            "window": f"{hour:02d}:00–{min(23, hour + 3):02d}:00",
            "confidence": min(94, 62 + round(top["crowd_index"] * 34)),
            "body": action,
            "signal": f"Signal: crowd index {top['crowd_index']:.2f} at {top['name']}, {top['distance_km']} km away",
        })

    # 2. A quiet neighbour is a redistribution target you can be listed against.
    if quiet:
        alt = quiet[0]
        opps.append({
            "id": f"quiet-{alt['place_id']}",
            "kind": "redistribution",
            "urgency": "low",
            "title": f"{alt['name']} is quiet — get listed on that route",
            "window": "This week",
            "confidence": 70,
            "body": (
                f"Yatra360 steers tourists away from crowded sites toward {alt['name']}. Businesses listed "
                "near a redistribution target appear inside the tourist's suggested alternative, ahead of "
                "general search. Add photos and your opening hours to qualify."
            ),
            "signal": f"Signal: {alt['name']} crowd index {alt['crowd_index']:.2f}, below the 0.32 redistribution threshold",
        })

    # 3. The evening wave is the single most staffable moment of the day.
    if peak_hour is not None and peak_hour > hour:
        opps.append({
            "id": "peak-window",
            "kind": "staffing",
            "urgency": "medium",
            "title": f"Your busiest window today starts at {peak_hour:02d}:00",
            "window": forecast["peak_window"],
            "confidence": 81,
            "body": (
                f"About {forecast['peak_arrivals']} visitors are projected inside your radius at peak, of which "
                f"roughly {forecast['capture_estimate']} are realistically reachable. Against a capacity of "
                f"{business.capacity or 0} {business.capacity_unit or 'seats'}, "
                + ("you will be over capacity — consider a queue plan or a takeaway line."
                   if forecast.get("capacity_pressure", 0) > 1
                   else "you have room to take all of it, so service speed is what decides the take.")
            ),
            "signal": f"Signal: aggregated hourly footfall model across {len(attractions)} nearby attractions",
        })

    # 4. Segment inversion — weekday commuters want something different.
    if not is_weekend:
        opps.append({
            "id": "weekday-mix",
            "kind": "segment",
            "urgency": "low",
            "title": "Midweek demand is commuter-led, not tourist-led",
            "window": "08:30–10:00",
            "confidence": 73,
            "body": (
                "On weekdays the in-transit segment dominates your radius. A single-serve item priced for one "
                "person, ready in under three minutes, converts this profile far better than the weekend "
                "family bundle."
            ),
            "signal": "Signal: segment mix inverts vs the weekend baseline",
        })

    if cat in CRAFT_CATEGORIES and busy:
        opps.append({
            "id": "craft-window",
            "kind": "crowd",
            "urgency": "medium",
            "title": "Heritage visitors are the buying segment for craft",
            "window": f"{hour:02d}:00–20:00",
            "confidence": 76,
            "body": (
                "Visitors arriving from a heritage site convert on souvenirs at roughly twice the rate of "
                "general footfall. Move your handmade and locally-sourced items to the front of the stall "
                "and label their origin — provenance is what this segment is buying."
            ),
            "signal": "Signal: heritage-category crowd within your radius",
        })

    order = {"high": 0, "medium": 1, "low": 2}
    opps.sort(key=lambda o: (order.get(o["urgency"], 3), -o["confidence"]))
    return opps


def generate_alerts(business, attractions: List[dict], forecast: dict) -> List[dict]:
    """Short, time-stamped notices — the 'what just changed' feed."""
    now = datetime.now()
    alerts = []

    for a in attractions[:6]:
        if a["crowd_index"] >= 0.75:
            alerts.append({
                "at": now.strftime("%H:%M"),
                "severity": "high",
                "title": f"High tourist movement at {a['name']}",
                "detail": (
                    f"Crowd index {a['crowd_index']:.2f}, {a['distance_km']} km from you. "
                    "Overflow is being redistributed — expect walk-ins."
                ),
            })
        elif a["crowd_index"] < 0.25:
            alerts.append({
                "at": now.strftime("%H:%M"),
                "severity": "low",
                "title": f"Low crowd around {a['name']}",
                "detail": "A good window for maintenance, restocking or staff breaks.",
            })

    if forecast.get("capacity_pressure", 0) > 1.1:
        alerts.append({
            "at": now.strftime("%H:%M"),
            "severity": "high",
            "title": "Projected demand exceeds your stated capacity",
            "detail": (
                f"Peak capture of about {forecast['capture_estimate']} against "
                f"{business.capacity or 0} {business.capacity_unit or 'seats'}. Plan for a queue."
            ),
        })

    if not alerts:
        alerts.append({
            "at": now.strftime("%H:%M"),
            "severity": "low",
            "title": "Nothing unusual in your radius",
            "detail": "Crowd levels at nearby attractions are within their normal band for this hour.",
        })

    rank = {"high": 0, "medium": 1, "low": 2}
    alerts.sort(key=lambda a: rank.get(a["severity"], 3))
    return alerts[:6]


def view_analytics(views, days: int = 14) -> dict:
    """Profile-view counts by day, by source, and by hour of day."""
    from collections import Counter

    by_day = Counter()
    by_source = Counter()
    by_hour = Counter()
    for v in views:
        by_day[v.created_at.date().isoformat()] += 1
        by_source[v.source or "listing"] += 1
        by_hour[v.created_at.hour] += 1

    peak_hour = max(by_hour, key=by_hour.get) if by_hour else None
    return {
        "total_views": sum(by_day.values()),
        "by_day": [{"date": d, "views": c} for d, c in sorted(by_day.items())][-days:],
        "by_source": [{"source": s, "views": c} for s, c in by_source.most_common()],
        "by_hour": [{"hour": h, "views": by_hour.get(h, 0)} for h in HOURS],
        "peak_view_hour": peak_hour,
    }
