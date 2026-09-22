"""
Yatra360 Smart Mobility Routing Engine.

This module generates comparable travel options for Pune.

Road-based routes use the OpenStreetMap road network through OSRM
(Open Source Routing Machine) so that the route geometry follows
actual mapped roads instead of a synthetic curved line.

Metro legs continue to use the curated Pune Metro station alignment
defined below.

Transport options:
    - Cab
    - Auto + Walk
    - Metro
    - PMPML Bus
    - Walk

Important:
    - Road geometry is obtained from OSRM when available.
    - If OSRM is temporarily unavailable, the module falls back
      to a deterministic estimated geometry so the prototype does
      not completely fail.
    - Travel time and fares remain prototype estimates. They are
      NOT live traffic, live PMPML timetable, or live fare data.
"""

import json
import math
import urllib.parse
import urllib.request
from typing import Any, Dict, List, Optional, Tuple


# --------------------------------------------------------------------------
# Types
# --------------------------------------------------------------------------

Coord = Tuple[float, float]


# --------------------------------------------------------------------------
# Pune Metro alignments
#
# Station order matters because the polyline follows this order.
# These coordinates are the prototype's curated metro alignment.
# --------------------------------------------------------------------------

AQUA_LINE = [
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


PURPLE_LINE = [
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


METRO_LINES = [
    ("Aqua Line", AQUA_LINE),
    ("Purple Line", PURPLE_LINE),
]


# --------------------------------------------------------------------------
# OSRM configuration
# --------------------------------------------------------------------------

OSRM_BASE_URL = "https://router.project-osrm.org"

OSRM_USER_AGENT = (
    "Yatra360-Smart-Mobility-Prototype/1.0 "
    "(educational prototype)"
)


# --------------------------------------------------------------------------
# HTTP helper
# --------------------------------------------------------------------------

def _fetch_json(
    url: str,
    timeout: int = 12,
) -> Optional[Dict[str, Any]]:
    """
    Fetch JSON from an external service.

    Returns:
        Parsed JSON dictionary, or None if the request fails.
    """

    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": OSRM_USER_AGENT,
            "Accept": "application/json",
        },
    )

    try:
        with urllib.request.urlopen(
            request,
            timeout=timeout,
        ) as response:

            raw = response.read().decode("utf-8")

            return json.loads(raw)

    except Exception:
        return None


# --------------------------------------------------------------------------
# Geometry helpers
# --------------------------------------------------------------------------

def haversine_km(
    a: Coord,
    b: Coord,
) -> float:
    """
    Great-circle distance in kilometres between
    two (latitude, longitude) coordinates.
    """

    radius = 6371.0

    lat1 = math.radians(a[0])
    lon1 = math.radians(a[1])

    lat2 = math.radians(b[0])
    lon2 = math.radians(b[1])

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    h = (
        math.sin(dlat / 2) ** 2
        +
        math.cos(lat1)
        * math.cos(lat2)
        * math.sin(dlon / 2) ** 2
    )

    return 2 * radius * math.asin(
        math.sqrt(h)
    )


# --------------------------------------------------------------------------
# FALLBACK GEOMETRY
# --------------------------------------------------------------------------

def fallback_road_geometry(
    start: Coord,
    end: Coord,
    seed: float = 1.0,
    steps: int = 28,
) -> List[List[float]]:
    """
    Fallback geometry used only if OSRM cannot be reached.

    This is NOT real road geometry.

    It keeps the prototype functional if an external routing
    request temporarily fails.
    """

    if start == end:
        return [
            [
                round(start[0], 6),
                round(start[1], 6),
            ]
        ]

    dlat = end[0] - start[0]
    dlon = end[1] - start[1]

    span = math.hypot(
        dlat,
        dlon,
    )

    if span == 0:
        px = 0.0
        py = 0.0
    else:
        px = -dlon / span
        py = dlat / span

    bow = span * 0.06 * seed

    points: List[List[float]] = []

    for i in range(steps + 1):

        t = i / steps

        offset = (
            math.sin(math.pi * t)
            * bow
        )

        offset += (
            math.sin(2 * math.pi * t)
            * bow
            * 0.22
        )

        lat = (
            start[0]
            + dlat * t
            + px * offset
        )

        lon = (
            start[1]
            + dlon * t
            + py * offset
        )

        points.append(
            [
                round(lat, 6),
                round(lon, 6),
            ]
        )

    return points


# --------------------------------------------------------------------------
# OSRM ROUTING
# --------------------------------------------------------------------------

def osrm_route(
    start: Coord,
    end: Coord,
) -> Optional[Dict[str, Any]]:
    """
    Get a real road-following route from OSRM.

    Input:
        start = (latitude, longitude)
        end   = (latitude, longitude)

    OSRM expects:
        longitude,latitude

    The returned geometry is converted back to:
        latitude,longitude

    Returns:
        {
            "geometry": [[lat, lon], ...],
            "distance_km": float,
            "duration_min": float
        }

    or None if OSRM cannot calculate the route.
    """

    if start == end:
        return {
            "geometry": [
                [
                    round(start[0], 6),
                    round(start[1], 6),
                ]
            ],
            "distance_km": 0.0,
            "duration_min": 0.0,
        }

    start_lat, start_lon = start
    end_lat, end_lon = end

    coordinates = (
        f"{start_lon},{start_lat};"
        f"{end_lon},{end_lat}"
    )

    query = urllib.parse.urlencode(
        {
            "overview": "full",
            "geometries": "geojson",
            "steps": "false",
        }
    )

    url = (
        f"{OSRM_BASE_URL}/route/v1/driving/"
        f"{coordinates}?{query}"
    )

    result = _fetch_json(
        url,
        timeout=12,
    )

    if not result:
        return None

    if result.get("code") != "Ok":
        return None

    routes = result.get(
        "routes",
        [],
    )

    if not routes:
        return None

    route = routes[0]

    geometry_data = route.get(
        "geometry",
        {},
    )

    coordinates_data = geometry_data.get(
        "coordinates",
        [],
    )

    if len(coordinates_data) < 2:
        return None

    # OSRM:
    # [longitude, latitude]
    #
    # Leaflet:
    # [latitude, longitude]

    geometry: List[List[float]] = []

    for point in coordinates_data:

        if (
            not isinstance(point, list)
            or len(point) < 2
        ):
            continue

        lon = float(point[0])
        lat = float(point[1])

        geometry.append(
            [
                round(lat, 6),
                round(lon, 6),
            ]
        )

    if len(geometry) < 2:
        return None

    distance_km = (
        float(route.get("distance", 0))
        / 1000
    )

    duration_min = (
        float(route.get("duration", 0))
        / 60
    )

    return {
        "geometry": geometry,
        "distance_km": round(
            distance_km,
            2,
        ),
        "duration_min": round(
            duration_min,
            1,
        ),
    }


# --------------------------------------------------------------------------
# Road route wrapper
# --------------------------------------------------------------------------

def get_road_route(
    start: Coord,
    end: Coord,
    fallback_seed: float = 1.0,
) -> Dict[str, Any]:
    """
    Get actual road geometry from OSRM.

    If OSRM is unavailable, use the deterministic fallback.

    The caller can therefore continue to receive a valid
    route response instead of the entire comparison failing.
    """

    result = osrm_route(
        start,
        end,
    )

    if result is not None:

        result["source"] = "OSRM / OpenStreetMap"

        return result

    # ------------------------------------------------------
    # Fallback
    # ------------------------------------------------------

    geometry = fallback_road_geometry(
        start,
        end,
        seed=fallback_seed,
    )

    estimated_distance = (
        haversine_km(
            start,
            end,
        )
        * 1.32
    )

    return {
        "geometry": geometry,
        "distance_km": round(
            estimated_distance,
            2,
        ),
        "duration_min": None,
        "source": "estimated fallback",
    }


# --------------------------------------------------------------------------
# Metro helpers
# --------------------------------------------------------------------------

def _nearest_station(
    point: Coord,
    line,
) -> Tuple[int, float]:
    """
    Return:
        station index
        distance from point to station in km
    """

    best_index = 0
    best_distance = float("inf")

    for index, (_, lat, lon) in enumerate(line):

        distance = haversine_km(
            point,
            (
                lat,
                lon,
            ),
        )

        if distance < best_distance:

            best_index = index
            best_distance = distance

    return (
        best_index,
        best_distance,
    )


def _best_metro_leg(
    start: Coord,
    end: Coord,
):
    """
    Select a useful metro line for the journey.

    Returns None if metro is not sensible.

    Returned dictionary:

        {
            "line": ...,
            "board": ...,
            "alight": ...,
            "geometry": ...,
            "ride_km": ...,
            "board_pt": ...,
            "alight_pt": ...
        }
    """

    best = None

    for line_name, line in METRO_LINES:

        board_index, board_distance = (
            _nearest_station(
                start,
                line,
            )
        )

        alight_index, alight_distance = (
            _nearest_station(
                end,
                line,
            )
        )

        if board_index == alight_index:
            continue

        access_km = (
            board_distance
            + alight_distance
        )

        ride_points = line[
            min(board_index, alight_index):
            max(board_index, alight_index) + 1
        ]

        if board_index > alight_index:

            ride_points = list(
                reversed(
                    ride_points
                )
            )

        ride_km = 0.0

        for i in range(
            len(ride_points) - 1
        ):

            current = ride_points[i]
            following = ride_points[i + 1]

            ride_km += haversine_km(
                (
                    current[1],
                    current[2],
                ),
                (
                    following[1],
                    following[2],
                ),
            )

        # Avoid nonsensical metro journeys.
        if access_km > 6.0:
            continue

        if ride_km < access_km * 0.8:
            continue

        score = (
            access_km
            - ride_km * 0.25
        )

        if (
            best is None
            or score < best[0]
        ):

            geometry = [
                [
                    round(station[1], 6),
                    round(station[2], 6),
                ]
                for station in ride_points
            ]

            best = (
                score,
                line_name,
                ride_points[0][0],
                ride_points[-1][0],
                geometry,
                ride_km,
                (
                    ride_points[0][1],
                    ride_points[0][2],
                ),
                (
                    ride_points[-1][1],
                    ride_points[-1][2],
                ),
            )

    if not best:
        return None

    (
        _,
        line_name,
        board,
        alight,
        geometry,
        ride_km,
        board_point,
        alight_point,
    ) = best

    return {
        "line": line_name,
        "board": board,
        "alight": alight,
        "geometry": geometry,
        "ride_km": ride_km,
        "board_pt": board_point,
        "alight_pt": alight_point,
    }


# --------------------------------------------------------------------------
# Public route comparison API
# --------------------------------------------------------------------------

def compare_routes(
    from_name: str,
    from_coord: Coord,
    to_name: str,
    to_coord: Coord,
) -> List[dict]:
    """
    Build comparable travel options between two Pune locations.

    Road-based options use OSRM geometry.

    The returned field names intentionally match the existing
    Yatra360 frontend contract:

        type
        cost
        time
        walking
        description
        geometry
        first_leg_geometry
        metro_geometry
        last_leg_geometry
    """

    # ------------------------------------------------------
    # Basic distance
    # ------------------------------------------------------

    direct_km = haversine_km(
        from_coord,
        to_coord,
    )

    # Get the actual road route once.
    #
    # Cab, Auto and Bus can share the same road geometry
    # because they use the same underlying road network.
    road_route = get_road_route(
        from_coord,
        to_coord,
        fallback_seed=1.0,
    )

    road_km = road_route["distance_km"]

    if not road_km or road_km <= 0:
        road_km = max(
            0.1,
            direct_km * 1.32,
        )

    osrm_duration = road_route.get(
        "duration_min"
    )

    options: List[dict] = []

    # ======================================================
    # CAB
    # ======================================================

    if osrm_duration is not None:

        cab_time = max(
            8,
            round(
                osrm_duration + 5
            ),
        )

    else:

        cab_time = max(
            8,
            round(
                road_km / 22 * 60
                + 5
            ),
        )

    cab_cost = max(
        70,
        round(
            (
                48
                + road_km * 17
            ) / 5
        ) * 5,
    )

    options.append(
        {
            "type": "Cab",
            "cost": cab_cost,
            "time": cab_time,
            "walking": 50,
            "description": (
                f"Door to door, about "
                f"{road_km:.1f} km of driving. "
                f"Least walking, highest fare."
            ),
            "geometry": road_route["geometry"],
            "routing_source": road_route["source"],
        }
    )

    # ======================================================
    # AUTO + WALK
    # ======================================================

    if road_km <= 18:

        if osrm_duration is not None:

            auto_time = max(
                10,
                round(
                    osrm_duration
                    * 1.05
                    + 6
                ),
            )

        else:

            auto_time = max(
                10,
                round(
                    road_km / 18 * 60
                    + 6
                ),
            )

        auto_cost = max(
            30,
            round(
                (
                    25
                    + road_km * 14
                ) / 5
            ) * 5,
        )

        options.append(
            {
                "type": "Auto + Walk",
                "cost": auto_cost,
                "time": auto_time,
                "walking": 250,
                "description": (
                    "Quicker than the bus through "
                    "inner-city roads, cheaper than "
                    "a cab. Short walk at each end."
                ),
                "geometry": road_route["geometry"],
                "routing_source": road_route["source"],
            }
        )

    # ======================================================
    # METRO
    # ======================================================

    metro = _best_metro_leg(
        from_coord,
        to_coord,
    )

    if metro:

        # --------------------------------------------------
        # First-mile road route
        # --------------------------------------------------

        first_route = get_road_route(
            from_coord,
            metro["board_pt"],
            fallback_seed=0.6,
        )

        # --------------------------------------------------
        # Last-mile road route
        # --------------------------------------------------

        last_route = get_road_route(
            metro["alight_pt"],
            to_coord,
            fallback_seed=0.6,
        )

        first_km = first_route[
            "distance_km"
        ]

        last_km = last_route[
            "distance_km"
        ]

        # --------------------------------------------------
        # Metro travel time
        # --------------------------------------------------

        ride_min = round(
            metro["ride_km"]
            / 32
            * 60
            + 4
        )

        # Approximate feeder/wait time.
        access_min = round(
            (
                first_km
                + last_km
            )
            / 12
            * 60
        ) + 6

        # --------------------------------------------------
        # Walking estimate
        # --------------------------------------------------

        walking_m = round(
            min(
                first_km,
                0.9,
            )
            * 1000
            +
            min(
                last_km,
                0.9,
            )
            * 1000
        )

        metro_cost = (
            max(
                10,
                min(
                    35,
                    10
                    + round(
                        metro["ride_km"]
                    ) * 2,
                ),
            )
            +
            (
                20
                if first_km > 1
                else 0
            )
        )

        options.append(
            {
                "type": (
                    f"Metro "
                    f"({metro['line']})"
                ),
                "cost": metro_cost,
                "time": (
                    ride_min
                    + access_min
                ),
                "walking": walking_m,
                "description": (
                    f"Board at "
                    f"{metro['board']}, "
                    f"ride to "
                    f"{metro['alight']} "
                    f"({metro['ride_km']:.1f} km). "
                    f"Traffic-independent for "
                    f"the main leg."
                ),

                # --------------------------------------------------
                # Important:
                # RouteMap.jsx expects these separate geometries.
                # --------------------------------------------------

                "geometry": None,

                "first_leg_geometry": (
                    first_route["geometry"]
                ),

                "metro_geometry": (
                    metro["geometry"]
                ),

                "last_leg_geometry": (
                    last_route["geometry"]
                ),

                "routing_source": (
                    "OSRM / OpenStreetMap "
                    "+ curated metro alignment"
                ),
            }
        )

    # ======================================================
    # PMPML BUS
    # ======================================================

    if osrm_duration is not None:

        bus_time = round(
            osrm_duration
            * 1.35
            + 12
        )

    else:

        bus_time = round(
            road_km / 13 * 60
            + 12
        )

    bus_cost = max(
        10,
        min(
            60,
            round(
                5
                + road_km * 2.4
            ),
        ),
    )

    options.append(
        {
            "type": "PMPML Bus",
            "cost": bus_cost,
            "time": bus_time,
            "walking": 700,
            "description": (
                "Cheapest motorised option. "
                "Expect a wait and a walk "
                "to the stop at both ends."
            ),
            "geometry": road_route["geometry"],
            "routing_source": road_route["source"],
        }
    )

    # ======================================================
    # WALKING
    # ======================================================

    if road_km <= 5.5:

        walk_km = direct_km * 1.22

        options.append(
            {
                "type": "Walk",
                "cost": 0,
                "time": round(
                    walk_km / 4.6 * 60
                ),
                "walking": round(
                    walk_km * 1000
                ),
                "description": (
                    "Free and direct. "
                    "Avoid between 12:00 "
                    "and 16:00 in summer."
                ),

                # --------------------------------------------------
                # OSRM public server provides driving routing.
                # We therefore keep the existing estimated walking
                # geometry rather than falsely presenting a driving
                # route as a pedestrian route.
                # --------------------------------------------------

                "geometry": fallback_road_geometry(
                    from_coord,
                    to_coord,
                    seed=0.35,
                ),

                "routing_source": (
                    "estimated walking geometry"
                ),
            }
        )

    # ======================================================
    # SORT
    # ======================================================

    options.sort(
        key=lambda option: option["time"]
    )

    return options
