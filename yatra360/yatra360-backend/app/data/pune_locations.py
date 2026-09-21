"""
Canonical catalogue of Pune locations the app knows how to route between.

This is the single source of truth for:
  * the Transit & Routes start/end dropdown (grouped by `group`)
  * the routing engine, which needs a lat/lon for every selectable point

Coordinates are approximate centroids, good enough for a prototype-level
route line. Swap for a geocoding service (Nominatim / Google Places) when
the production build lands.
"""

# name -> (lat, lon, group)
PUNE_LOCATIONS = {
    # ---- Attractions & landmarks ----
    "Shaniwar Wada": (18.5195, 73.8553, "Attractions & landmarks"),
    "Aga Khan Palace": (18.5525, 73.9012, "Attractions & landmarks"),
    "Dagdusheth Halwai Temple": (18.5164, 73.8553, "Attractions & landmarks"),
    "Sinhagad Fort": (18.3664, 73.7550, "Attractions & landmarks"),
    "Lal Mahal": (18.5187, 73.8564, "Attractions & landmarks"),
    "Pataleshwar Cave Temple": (18.5225, 73.8465, "Attractions & landmarks"),
    "Parvati Hill": (18.4915, 73.8459, "Attractions & landmarks"),
    "Raja Dinkar Kelkar Museum": (18.5100, 73.8547, "Attractions & landmarks"),
    "Tulshibaug Ram Mandir & Market": (18.5158, 73.8547, "Attractions & landmarks"),
    "Bal Gandharva Rang Mandir": (18.5245, 73.8410, "Attractions & landmarks"),
    "Vishrambaug Wada": (18.5117, 73.8533, "Attractions & landmarks"),

    # ---- Parks, lakes & nature ----
    "Osho Teerth Park": (18.5362, 73.8935, "Parks, lakes & nature"),
    "Pashan Lake": (18.5360, 73.7870, "Parks, lakes & nature"),
    "Khadakwasla Dam": (18.4380, 73.7680, "Parks, lakes & nature"),
    "Empress Botanical Garden": (18.5100, 73.8830, "Parks, lakes & nature"),
    "Saras Baug": (18.5011, 73.8520, "Parks, lakes & nature"),
    "Taljai Hills": (18.4823, 73.8395, "Parks, lakes & nature"),
    "Vetal Tekdi": (18.5150, 73.8190, "Parks, lakes & nature"),

    # ---- Transit hubs ----
    "Pune Railway Station": (18.5286, 73.8743, "Transit hubs"),
    "Pune Airport (Lohegaon)": (18.5793, 73.9089, "Transit hubs"),
    "Swargate Bus Stand": (18.5010, 73.8580, "Transit hubs"),
    "Shivajinagar Bus Stand": (18.5308, 73.8478, "Transit hubs"),
    "Wakadewadi Metro Station": (18.5455, 73.8432, "Transit hubs"),
    "Pimpri Metro Station": (18.6280, 73.8000, "Transit hubs"),
    "Vanaz Metro Station": (18.5074, 73.8070, "Transit hubs"),
    "Ramwadi Metro Station": (18.5480, 73.9130, "Transit hubs"),
    "Civil Court Interchange": (18.5290, 73.8560, "Transit hubs"),

    # ---- Neighbourhoods & areas ----
    "Akurdi": (18.6480, 73.7650, "Neighbourhoods & areas"),
    "Amanora Park Town": (18.5190, 73.9390, "Neighbourhoods & areas"),
    "Aundh": (18.5590, 73.8070, "Neighbourhoods & areas"),
    "Balewadi": (18.5750, 73.7690, "Neighbourhoods & areas"),
    "Baner": (18.5590, 73.7870, "Neighbourhoods & areas"),
    "Bavdhan": (18.5170, 73.7740, "Neighbourhoods & areas"),
    "Bibwewadi": (18.4690, 73.8620, "Neighbourhoods & areas"),
    "Camp (MG Road)": (18.5150, 73.8790, "Neighbourhoods & areas"),
    "Chinchwad": (18.6420, 73.7990, "Neighbourhoods & areas"),
    "Deccan Gymkhana": (18.5160, 73.8400, "Neighbourhoods & areas"),
    "FC Road": (18.5220, 73.8410, "Neighbourhoods & areas"),
    "Hadapsar": (18.5089, 73.9260, "Neighbourhoods & areas"),
    "Hinjewadi Phase 1": (18.5910, 73.7380, "Neighbourhoods & areas"),
    "JM Road": (18.5240, 73.8450, "Neighbourhoods & areas"),
    "Kalyani Nagar": (18.5480, 73.9010, "Neighbourhoods & areas"),
    "Kasba Peth": (18.5210, 73.8560, "Neighbourhoods & areas"),
    "Kharadi": (18.5510, 73.9430, "Neighbourhoods & areas"),
    "Kondhwa": (18.4650, 73.8880, "Neighbourhoods & areas"),
    "Koregaon Park": (18.5362, 73.8880, "Neighbourhoods & areas"),
    "Kothrud": (18.5074, 73.8077, "Neighbourhoods & areas"),
    "Magarpatta City": (18.5150, 73.9290, "Neighbourhoods & areas"),
    "Pashan": (18.5380, 73.7900, "Neighbourhoods & areas"),
    "Pimpri": (18.6280, 73.8000, "Neighbourhoods & areas"),
    "Shivajinagar": (18.5308, 73.8478, "Neighbourhoods & areas"),
    "Savitribai Phule Pune University": (18.5530, 73.8250, "Neighbourhoods & areas"),
    "Viman Nagar": (18.5670, 73.9140, "Neighbourhoods & areas"),
    "Wakad": (18.5980, 73.7620, "Neighbourhoods & areas"),
    "Wanowrie": (18.4890, 73.8990, "Neighbourhoods & areas"),
    "Yerawada": (18.5510, 73.8810, "Neighbourhoods & areas"),

    # ---- Food & local favourites ----
    "Phlox Local Thali House": (18.5100, 73.8300, "Food & local favourites"),
    "Kaka Halwai (Kasba Peth)": (18.5202, 73.8567, "Food & local favourites"),
    "Vaishali Restaurant (FC Road)": (18.5228, 73.8409, "Food & local favourites"),
    "German Bakery (Koregaon Park)": (18.5365, 73.8905, "Food & local favourites"),
}


def location_names():
    """Sorted list of every selectable location name."""
    return sorted(PUNE_LOCATIONS.keys())


def grouped_locations():
    """
    [{group, locations: [{name, lat, lon}]}] — the shape the frontend
    dropdown renders as <optgroup>s.
    """
    buckets = {}
    for name, (lat, lon, group) in PUNE_LOCATIONS.items():
        buckets.setdefault(group, []).append({"name": name, "lat": lat, "lon": lon})

    # Stable, sensible ordering rather than dict insertion order.
    order = [
        "Attractions & landmarks",
        "Food & local favourites",
        "Parks, lakes & nature",
        "Transit hubs",
        "Neighbourhoods & areas",
    ]
    out = []
    for group in order:
        if group in buckets:
            out.append({"group": group, "locations": sorted(buckets[group], key=lambda x: x["name"])})
    for group in sorted(set(buckets) - set(order)):
        out.append({"group": group, "locations": sorted(buckets[group], key=lambda x: x["name"])})
    return out


def coords_for(name: str):
    """
    Resolve a location name to (lat, lon). Tolerates case differences and
    a missing/extra parenthetical, because itinerary place names and
    dropdown labels don't always match character for character.
    """
    if not name:
        return None

    if name in PUNE_LOCATIONS:
        lat, lon, _ = PUNE_LOCATIONS[name]
        return (lat, lon)

    target = _normalise(name)
    for key, (lat, lon, _) in PUNE_LOCATIONS.items():
        if _normalise(key) == target:
            return (lat, lon)

    # Last resort: prefix match, so "Camp" finds "Camp (MG Road)".
    for key, (lat, lon, _) in PUNE_LOCATIONS.items():
        if _normalise(key).startswith(target) or target.startswith(_normalise(key)):
            return (lat, lon)

    return None


def _normalise(value: str) -> str:
    base = value.split("(")[0]
    return "".join(ch for ch in base.lower() if ch.isalnum())
