"""
Route comparison engine for the Transit & Routes page.

The prototype has no live routing provider, so this module synthesises a
*plausible and deterministic* answer: real Pune Metro alignments for the
metro leg, and a smoothed multi-point curve for road legs so the line on
the map follows a believable path rather than a straight ruler stroke.

Everything returned here is clearly labelled as an estimate in the UI.
Swap `road_geometry()` for an OSRM/Mapbox Directions call and the rest of
the module (costing, mode selection, leg splitting) keeps working.
"""

import math
from typing import List, Optional, Tuple

Coord = Tuple[float, float]


# --------------------------------------------------------------------------
# Pune Metro alignments (station order matters — the polyline follows it)
# --------------------------------------------------------------------------

AQUA_LINE = [  # Line 1: Vanaz <-> Ramwadi
    ("Vanaz", 18.5074, 73.8070),
    ("Anand Nagar", 18.5080, 73.8135),
    ("Ideal Colony", 18.5090, 73.8196),
    ("Nal Stop", 18.5103, 73.8265),
    ("Garware College", 18.5145, 73.8340),
    ("Deccan Gymkhana", 18.5160, 73.8400),
    ("Chhatrapati Sambhaji Udyan", 18.5185, 73.8440),
    ("PMC Bhavan", 18.5237, 73.8517),
    ("Civil Court", 18.5290, 73.8560),
    ("Mangalwar Peth", 18.5310, 73.8660),
    ("Pune Railway Station", 18.5286, 73.8743),
    ("Ruby Hall Clinic", 18.5330, 73.8800),
    ("Bund Garden", 18.5370, 73.8865),
    ("Yerawada", 18.5510, 73.8810),
    ("Kalyani Nagar", 18.5480, 73.9010),
    ("Ramwadi", 18.5480, 73.9130),
]

PURPLE_LINE = [  # Line 2: PCMC <-> Swargate
    ("PCMC Bhavan", 18.6470, 73.7990),
    ("Sant Tukaram Nagar", 18.6350, 73.8010),
    ("Bhosari", 18.6220, 73.8390),
    ("Kasarwadi", 18.6000, 73.8230),
    ("Phugewadi", 18.5890, 73.8290),
    ("Dapodi", 18.5770, 73.8330),
    ("Bopodi", 18.5620, 73.8360),
    ("Khadki", 18.5560, 73.8390),
    ("Range Hills", 18.5490, 73.8410),
    ("Shivajinagar", 18.5308, 73.8478),
    ("Civil Court", 18.5290, 73.8560),
    ("Budhwar Peth", 18.5160, 73.8545),
    ("Mandai", 18.5100, 73.8555),
    ("Swargate", 18.5010, 73.8580),
]

METRO_LINES = [("Aqua Line", AQUA_LINE), ("Purple Line", PURPLE_LINE)]


# --------------------------------------------------------------------------
# Geometry helpers
# --------------------------------------------------------------------------

def haversine_km(a: Coord, b: Coord) -> float:
    """Great-circle distance in km between two (lat, lon) pairs."""
    r = 6371.0
    lat1, lon1 = math.radians(a[0]), math.radians(a[1])
    lat2, lon2 = math.radians(b[0]), math.radians(b[1])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))


def road_geometry(start: Coord, end: Coord, seed: float = 1.0, steps: int = 28) -> List[Coord]:
    """
    A smoothed curve between two points, offset perpendicular to the direct
    line so the drawn route reads as a road rather than a ruler stroke.

    `seed` varies the bow per transport mode, so overlapping options stay
    visually distinguishable on the map.
    """
    if start == end:
        return [list(start)]

    dlat = end[0] - start[0]
    dlon = end[1] - start[1]
    span = math.hypot(dlat, dlon)

    # Perpendicular unit vector, scaled to a gentle bow (~6% of the span).
    if span == 0:
        px = py = 0.0
    else:
        px, py = -dlon / span, dlat / span
    bow = span * 0.06 * seed

    points: List[Coord] = []
    for i in range(steps + 1):
        t = i / steps
        # sin() gives zero offset at both endpoints and max in the middle.
        offset = math.sin(math.pi * t) * bow
        # A small second harmonic keeps the line from looking like one clean arc.
        offset += math.sin(2 * math.pi * t) * bow * 0.22
        lat = start[0] + dlat * t + px * offset
        lon = start[1] + dlon * t + py * offset
        points.append([round(lat, 6), round(lon, 6)])
    return points


def _nearest_station(point: Coord, line) -> Tuple[int, float]:
    """Index of the closest station on `line`, and its distance in km."""
    best_i, best_d = 0, float("inf")
    for i, (_, lat, lon) in enumerate(line):
        d = haversine_km(point, (lat, lon))
        if d < best_d:
            best_i, best_d = i, d
    return best_i, best_d


def _best_metro_leg(start: Coord, end: Coord):
    """
    Pick the metro line that best serves this journey, if any.

    Returns (line_name, board_station, alight_station, geometry, ride_km)
    or None when the metro doesn't sensibly help.
    """
    best = None
    for line_name, line in METRO_LINES:
        bi, bd = _nearest_station(start, line)
        ai, ad = _nearest_station(end, line)
        if bi == ai:
            continue  # boarding and alighting at the same station helps nobody

        # Metro only makes sense if both ends are reasonably close to it and
        # the ride itself is longer than the walk/auto to reach it.
        access_km = bd + ad
        ride_pts = line[min(bi, ai): max(bi, ai) + 1]
        if bi > ai:
            ride_pts = list(reversed(ride_pts))
        ride_km = sum(
            haversine_km((ride_pts[i][1], ride_pts[i][2]), (ride_pts[i + 1][1], ride_pts[i + 1][2]))
            for i in range(len(ride_pts) - 1)
        )
        if access_km > 6.0 or ride_km < access_km * 0.8:
            continue

        score = access_km - ride_km * 0.25
        if best is None or score < best[0]:
            geometry = [[round(lat, 6), round(lon, 6)] for _, lat, lon in ride_pts]
            best = (score, line_name, ride_pts[0][0], ride_pts[-1][0], geometry, ride_km,
                    (ride_pts[0][1], ride_pts[0][2]), (ride_pts[-1][1], ride_pts[-1][2]))
    if not best:
        return None
    _, line_name, board, alight, geometry, ride_km, board_pt, alight_pt = best
    return {
        "line": line_name, "board": board, "alight": alight,
        "geometry": geometry, "ride_km": ride_km,
        "board_pt": board_pt, "alight_pt": alight_pt,
    }


# --------------------------------------------------------------------------
# Public API
# --------------------------------------------------------------------------

def compare_routes(from_name: str, from_coord: Coord, to_name: str, to_coord: Coord) -> List[dict]:
    """Build the list of comparable travel options between two points."""
    direct_km = haversine_km(from_coord, to_coord)
    # Road distance is always longer than the crow-flies distance.
    road_km = direct_km * 1.32

    options: List[dict] = []

    # ---- Cab / ride-hailing ------------------------------------------------
    cab_time = max(8, round(road_km / 22 * 60 + 5))
    options.append({
        "type": "Cab",
        "cost": max(70, round((48 + road_km * 17) / 5) * 5),
        "time": cab_time,
        "walking": 50,
        "description": f"Door to door, about {road_km:.1f} km of driving. Least walking, highest fare.",
        "geometry": road_geometry(from_coord, to_coord, seed=1.0),
    })

    # ---- Auto rickshaw -----------------------------------------------------
    if road_km <= 18:
        auto_time = max(10, round(road_km / 18 * 60 + 6))
        options.append({
            "type": "Auto + Walk",
            "cost": max(30, round((25 + road_km * 14) / 5) * 5),
            "time": auto_time,
            "walking": 250,
            "description": "Quicker than the bus through inner-city lanes, cheaper than a cab. Short walk at each end.",
            "geometry": road_geometry(from_coord, to_coord, seed=-0.8),
        })

    # ---- Metro (with first/last-mile legs) ---------------------------------
    metro = _best_metro_leg(from_coord, to_coord)
    if metro:
        first_km = haversine_km(from_coord, metro["board_pt"]) * 1.3
        last_km = haversine_km(metro["alight_pt"], to_coord) * 1.3
        ride_min = round(metro["ride_km"] / 32 * 60 + 4)
        access_min = round((first_km + last_km) / 12 * 60) + 6  # feeder auto/walk + wait
        walking_m = round(min(first_km, 0.9) * 1000 + min(last_km, 0.9) * 1000)
        options.append({
            "type": f"Metro ({metro['line']})",
            "cost": max(10, min(35, 10 + round(metro["ride_km"]) * 2)) + (20 if first_km > 1 else 0),
            "time": ride_min + access_min,
            "walking": walking_m,
            "description": (
                f"Board at {metro['board']}, ride to {metro['alight']} "
                f"({metro['ride_km']:.1f} km). Traffic-independent for the main leg."
            ),
            "geometry": None,
            "first_leg_geometry": road_geometry(from_coord, metro["board_pt"], seed=0.6, steps=14),
            "metro_geometry": metro["geometry"],
            "last_leg_geometry": road_geometry(metro["alight_pt"], to_coord, seed=0.6, steps=14),
        })

    # ---- PMPML bus ---------------------------------------------------------
    bus_time = round(road_km / 13 * 60 + 12)
    options.append({
        "type": "PMPML Bus",
        "cost": max(10, min(60, round(5 + road_km * 2.4))),
        "time": bus_time,
        "walking": 700,
        "description": "Cheapest motorised option. Expect a wait and a walk to the stop at both ends.",
        "geometry": road_geometry(from_coord, to_coord, seed=-1.6),
    })

    # ---- Walking -----------------------------------------------------------
    if road_km <= 5.5:
        walk_km = direct_km * 1.22
        options.append({
            "type": "Walk",
            "cost": 0,
            "time": round(walk_km / 4.6 * 60),
            "walking": round(walk_km * 1000),
            "description": "Free and direct. Avoid between 12:00 and 16:00 in summer.",
            "geometry": road_geometry(from_coord, to_coord, seed=0.35),
        })

    options.sort(key=lambda o: o["time"])
    return options
