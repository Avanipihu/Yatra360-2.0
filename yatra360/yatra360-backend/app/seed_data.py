from datetime import date

from sqlalchemy.orm import Session

from . import models


def seed_if_empty(db: Session):
    if db.query(models.Place).count() > 0:
        return  # already seeded

    places = [
        models.Place(
            id="shaniwarwada", name="Shaniwar Wada", category="History",
            lat=18.5195, lon=73.8553, open_hours="8:00 AM \u2013 6:30 PM",
            cost="Low", estimated_demand="High",
            accessibility=["Minimal walking"],
            good_for=["Family", "Solo", "Friends", "Couple"],
            description="Historic fortification and the seat of the Peshwas, known for its light-and-sound show.",
            source="Maharashtra Tourism (MTDC)", last_verified=date(2026, 8, 14),
            image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Shaniwarwada_gate.jpg/1024px-Shaniwarwada_gate.jpg",
            image_credit="Photo: Wikimedia Commons (CC BY-SA)", locality="Kasba Peth",
        ),
        models.Place(
            id="aga-khan-palace", name="Aga Khan Palace", category="History",
            lat=18.5525, lon=73.9012, open_hours="9:00 AM \u2013 5:30 PM",
            cost="Low", estimated_demand="Moderate",
            accessibility=["Minimal walking", "Elderly-friendly", "Child-friendly"],
            good_for=["Family", "Senior citizens", "Solo"],
            description="Spacious heritage grounds linked to Gandhi\u2019s internment; quieter alternative to central-city forts.",
            source="ASI Pune Circle", last_verified=date(2026, 8, 10),
            image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Aga_Khan_Palace_Pune.jpg/1024px-Aga_Khan_Palace_Pune.jpg",
            image_credit="Photo: Wikimedia Commons (CC BY-SA)", locality="Yerawada",
        ),
        models.Place(
            id="sinhagad-fort", name="Sinhagad Fort", category="Adventure",
            lat=18.3664, lon=73.7550, open_hours="Open 24 hours (visits recommended 7 AM \u2013 6 PM)",
            cost="Low", estimated_demand="High",
            accessibility=[],
            good_for=["Friends", "Couple"],
            description="Hilltop fort with trekking trails and panoramic Sahyadri views; steep walking required.",
            source="Pune District Tourism", last_verified=date(2026, 8, 1),
            image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Sinhagad_Fort_Pune.jpg/1024px-Sinhagad_Fort_Pune.jpg",
            image_credit="Photo: Wikimedia Commons (CC BY-SA)", locality="Sinhagad Road",
        ),
        models.Place(
            id="dagdusheth-temple", name="Dagdusheth Halwai Ganpati Temple", category="Spiritual",
            lat=18.5164, lon=73.8553, open_hours="6:00 AM \u2013 11:30 PM",
            cost="Free", estimated_demand="High",
            accessibility=["Minimal walking", "Child-friendly"],
            good_for=["Family", "Solo", "Senior citizens"],
            description="One of Pune\u2019s most visited temples, especially crowded on weekends and festival days.",
            source="Pune Municipal Corporation (PMC)", last_verified=date(2026, 8, 14),
            image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Dagadusheth_Halwai_Ganapati_Temple.jpg/1024px-Dagadusheth_Halwai_Ganapati_Temple.jpg",
            image_credit="Photo: Wikimedia Commons (CC BY-SA)", locality="Budhwar Peth",
        ),
        models.Place(
            id="tulshibaug-ram-mandir", name="Tulshibaug Ram Mandir & Market", category="Local experiences",
            lat=18.5158, lon=73.8547, open_hours="8:00 AM \u2013 9:00 PM",
            cost="Free", estimated_demand="Moderate",
            accessibility=["Child-friendly"],
            good_for=["Family", "Friends", "Solo"],
            description="A quieter spiritual stop next to a bustling local market \u2014 a lower-demand alternative near Dagdusheth.",
            source="PMC Heritage Cell", last_verified=date(2026, 8, 5),
            image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Tulshibaug_Ram_Mandir.jpg/1024px-Tulshibaug_Ram_Mandir.jpg",
            image_credit="Photo: Wikimedia Commons (CC BY-SA)", locality="Budhwar Peth",
        ),
        models.Place(
            id="osho-garden", name="Osho Teerth Park", category="Nature",
            lat=18.5362, lon=73.8935, open_hours="6:00 AM \u2013 9:00 PM",
            cost="Free", estimated_demand="Low",
            accessibility=["Minimal walking", "Elderly-friendly", "Wheelchair accessible", "Child-friendly"],
            good_for=["Family", "Senior citizens", "Solo"],
            description="A landscaped, low-crowd park \u2014 good for children and elderly travellers who need rest points.",
            source="PMC Garden Dept.", last_verified=date(2026, 7, 28),
            image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Osho_Teerth_Park_Pune.jpg/1024px-Osho_Teerth_Park_Pune.jpg",
            image_credit="Photo: Wikimedia Commons (CC BY-SA)", locality="Koregaon Park",
        ),
        models.Place(
            id="phlox-cafe", name="Phlox Local Thali House", category="Food",
            lat=18.5100, lon=73.8300, open_hours="12:00 PM \u2013 10:30 PM",
            cost="Moderate", estimated_demand="Moderate",
            accessibility=["Child-friendly"],
            good_for=["Family", "Friends", "Solo"],
            description="Home-style Maharashtrian thali, popular with families for early dinners.",
            source="Curated (team-verified)", last_verified=date(2026, 8, 12),
            image_url="https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=1024&q=70",
            image_credit="Photo: Unsplash", locality="Kothrud",
        ),
    ]
    db.add_all(places)

    hotels = [
        models.Hotel(id="hotel-1", name="Hotel Sunderban", area="Shivajinagar",
                     price_per_night=2200, budget="Moderate", rating=4.1,
                     distance_to_center_km=1.8, source="Sample data (govt. tourism API pending)"),
        models.Hotel(id="hotel-2", name="Backpacker Panda Koregaon Park", area="Koregaon Park",
                     price_per_night=900, budget="Low", rating=4.3,
                     distance_to_center_km=3.2, source="Sample data (govt. tourism API pending)"),
        models.Hotel(id="hotel-3", name="The Pune Residency", area="Camp",
                     price_per_night=5400, budget="Premium", rating=4.6,
                     distance_to_center_km=0.9, source="Sample data (govt. tourism API pending)"),
    ]
    db.add_all(hotels)

    # Default (place_id=None) route options, used as a fallback whenever a
    # place doesn't have its own routing entries yet.
    default_routes = [
        models.RouteOption(place_id=None, mode="Bus + Metro", cost_inr=40, time_min=55, walking_m=500,
                            notes="Cheapest option, one interchange at Shivajinagar"),
        models.RouteOption(place_id=None, mode="Auto + Walk", cost_inr=120, time_min=35, walking_m=600,
                            notes="Faster, moderate walking"),
        models.RouteOption(place_id=None, mode="Cab", cost_inr=220, time_min=25, walking_m=50,
                            notes="Least walking, highest cost"),
        models.RouteOption(place_id=None, mode="Walk", cost_inr=0, time_min=70, walking_m=4200,
                            notes="Only suitable if minimal-walking is not a constraint"),
    ]
    db.add_all(default_routes)

    contacts = [
        models.EmergencyContact(type="Police", name="Pune City Police Control Room", number="100",
                                 area="City-wide", source="Maharashtra Police", last_verified=date(2026, 9, 1)),
        models.EmergencyContact(type="Women\u2019s Helpline", name="Women Helpline (All India)", number="1091",
                                 area="City-wide", source="Ministry of Women & Child Development", last_verified=date(2026, 9, 1)),
        models.EmergencyContact(type="Ambulance", name="Emergency Medical Services", number="108",
                                 area="City-wide", source="Maharashtra Emergency Medical Services", last_verified=date(2026, 9, 1)),
        models.EmergencyContact(type="Hospital", name="Sassoon General Hospital", number="020-2612-8000",
                                 area="Near Shaniwar Wada", source="Sassoon Hospital, PMC", last_verified=date(2026, 8, 20)),
        models.EmergencyContact(type="Tourist Helpline", name="Maharashtra Tourism Helpline", number="1800-22-1000",
                                 area="State-wide", source="MTDC", last_verified=date(2026, 8, 15)),
    ]
    db.add_all(contacts)

    parking = [
        models.ParkingSpot(id="p1", near="Shaniwar Wada", availability="Low",
                            note="Weekend footfall fills the paid lot by 11 AM \u2014 arrive early or use two-wheeler stand."),
        models.ParkingSpot(id="p2", near="Aga Khan Palace", availability="High",
                            note="Large open lot, rarely full even on weekends."),
        models.ParkingSpot(id="p3", near="Dagdusheth Temple", availability="Low",
                            note="No dedicated lot nearby; nearest paid parking is 400m away."),
        models.ParkingSpot(id="p4", near="Osho Teerth Park", availability="Moderate",
                            note="Street parking generally available on weekdays."),
    ]
    db.add_all(parking)

    db.add_all(_extra_places())
    db.commit()

    seed_demo_businesses(db)

    # Crowd-alternative pairs need place PKs to already exist, so add after commit.
    alternatives = [
        models.PlaceAlternative(overcrowded_id="shaniwarwada", alternative_id="aga-khan-palace",
                                 shared_tag="Peshwa-era history, similar architecture"),
        models.PlaceAlternative(overcrowded_id="dagdusheth-temple", alternative_id="tulshibaug-ram-mandir",
                                 shared_tag="Spiritual experience, walking distance apart"),
    ]
    alternatives += [
        models.PlaceAlternative(overcrowded_id="sinhagad-fort", alternative_id="vetal-tekdi",
                                 shared_tag="Hill walk with city views, far shorter queue"),
        models.PlaceAlternative(overcrowded_id="shaniwarwada", alternative_id="vishrambaug-wada",
                                 shared_tag="Peshwa-era wada, ten minutes away and rarely busy"),
        models.PlaceAlternative(overcrowded_id="dagdusheth-temple", alternative_id="pataleshwar",
                                 shared_tag="Rock-cut temple, calm even at festival time"),
    ]
    db.add_all(alternatives)
    db.commit()


# --------------------------------------------------------------------------
# Additional places, so itineraries have depth and every card has a photo
# --------------------------------------------------------------------------

def _extra_places():
    return [
        models.Place(
            id="pataleshwar", name="Pataleshwar Cave Temple", category="Spiritual",
            lat=18.5225, lon=73.8465, open_hours="8:00 AM \u2013 5:30 PM",
            cost="Free", estimated_demand="Low",
            accessibility=["Minimal walking", "Elderly-friendly"],
            good_for=["Solo", "Couple", "Senior citizens", "Family"],
            description="An 8th-century rock-cut temple carved from a single basalt outcrop, hidden just off JM Road.",
            source="ASI Pune Circle", last_verified=date(2026, 8, 9),
            image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Pataleshwar_Cave_Temple_Pune.jpg/1024px-Pataleshwar_Cave_Temple_Pune.jpg",
            image_credit="Photo: Wikimedia Commons (CC BY-SA)", locality="Shivajinagar",
        ),
        models.Place(
            id="vishrambaug-wada", name="Vishrambaug Wada", category="History",
            lat=18.5117, lon=73.8533, open_hours="9:30 AM \u2013 5:30 PM",
            cost="Low", estimated_demand="Low",
            accessibility=["Minimal walking", "Child-friendly"],
            good_for=["Family", "Solo", "Senior citizens"],
            description="Peshwa Bajirao II's residence, known for its carved teak entrance \u2014 the quiet counterpart to Shaniwar Wada.",
            source="PMC Heritage Cell", last_verified=date(2026, 8, 6),
            image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Vishrambaug_Wada_Pune.jpg/1024px-Vishrambaug_Wada_Pune.jpg",
            image_credit="Photo: Wikimedia Commons (CC BY-SA)", locality="Shukrawar Peth",
        ),
        models.Place(
            id="kelkar-museum", name="Raja Dinkar Kelkar Museum", category="Culture",
            lat=18.5100, lon=73.8547, open_hours="10:00 AM \u2013 5:30 PM",
            cost="Low", estimated_demand="Moderate",
            accessibility=["Minimal walking", "Child-friendly", "Elderly-friendly"],
            good_for=["Family", "Solo", "Couple", "Senior citizens"],
            description="Three floors of everyday Maharashtrian objects \u2014 lamps, instruments, door frames \u2014 collected over a lifetime.",
            source="Maharashtra Tourism (MTDC)", last_verified=date(2026, 8, 11),
            image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Raja_Dinkar_Kelkar_Museum.jpg/1024px-Raja_Dinkar_Kelkar_Museum.jpg",
            image_credit="Photo: Wikimedia Commons (CC BY-SA)", locality="Shukrawar Peth",
        ),
        models.Place(
            id="parvati-hill", name="Parvati Hill Temple", category="Spiritual",
            lat=18.4915, lon=73.8459, open_hours="5:00 AM \u2013 8:00 PM",
            cost="Free", estimated_demand="Moderate",
            accessibility=[],
            good_for=["Solo", "Friends", "Couple"],
            description="103 stone steps to a Peshwa-era temple complex with the best free view over the city.",
            source="PMC Heritage Cell", last_verified=date(2026, 8, 3),
            image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Parvati_Hill_Temple_Pune.jpg/1024px-Parvati_Hill_Temple_Pune.jpg",
            image_credit="Photo: Wikimedia Commons (CC BY-SA)", locality="Parvati",
        ),
        models.Place(
            id="vetal-tekdi", name="Vetal Tekdi", category="Nature",
            lat=18.5150, lon=73.8190, open_hours="5:30 AM \u2013 7:00 PM",
            cost="Free", estimated_demand="Low",
            accessibility=[],
            good_for=["Solo", "Friends", "Couple"],
            description="Pune's highest hill, a genuine forest walk inside the city. Go at sunrise.",
            source="PMC Garden Dept.", last_verified=date(2026, 7, 30),
            image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Vetal_Tekdi_Pune.jpg/1024px-Vetal_Tekdi_Pune.jpg",
            image_credit="Photo: Wikimedia Commons (CC BY-SA)", locality="Kothrud",
        ),
        models.Place(
            id="pashan-lake", name="Pashan Lake", category="Nature",
            lat=18.5360, lon=73.7870, open_hours="6:00 AM \u2013 6:00 PM",
            cost="Free", estimated_demand="Low",
            accessibility=["Minimal walking", "Wheelchair accessible", "Elderly-friendly", "Child-friendly"],
            good_for=["Family", "Senior citizens", "Couple"],
            description="A restored wetland and birding spot with a flat walking path \u2014 flamingos pass through in winter.",
            source="PMC Environment Cell", last_verified=date(2026, 8, 2),
            image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Pashan_Lake_Pune.jpg/1024px-Pashan_Lake_Pune.jpg",
            image_credit="Photo: Wikimedia Commons (CC BY-SA)", locality="Pashan",
        ),
        models.Place(
            id="saras-baug", name="Saras Baug", category="Local experiences",
            lat=18.5011, lon=73.8520, open_hours="5:00 AM \u2013 9:00 PM",
            cost="Free", estimated_demand="Moderate",
            accessibility=["Minimal walking", "Child-friendly", "Elderly-friendly"],
            good_for=["Family", "Friends", "Senior citizens"],
            description="Garden, Ganpati temple and the city's best-loved evening bhel stalls, all on one green island.",
            source="PMC Garden Dept.", last_verified=date(2026, 8, 7),
            image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Saras_Baug_Pune.jpg/1024px-Saras_Baug_Pune.jpg",
            image_credit="Photo: Wikimedia Commons (CC BY-SA)", locality="Parvati",
        ),
        models.Place(
            id="tukaram-paduka-chowk", name="Sarasbaug Street Food Lane", category="Food",
            lat=18.5020, lon=73.8535, open_hours="4:00 PM \u2013 11:00 PM",
            cost="Low", estimated_demand="Moderate",
            accessibility=["Child-friendly"],
            good_for=["Family", "Friends", "Solo"],
            description="Evening-only stalls doing bhel, sabudana vada and kulfi \u2014 where Pune actually eats after work.",
            source="Curated (team-verified)", last_verified=date(2026, 8, 13),
            image_url="https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1024&q=70",
            image_credit="Photo: Unsplash", locality="Parvati",
        ),
    ]


# --------------------------------------------------------------------------
# Demo businesses, so the console and the tourist listings are never empty
# --------------------------------------------------------------------------

DEMO_PASSWORD = "yatra360demo"


def seed_demo_businesses(db: Session):
    """
    Seeds a handful of registered local businesses.

    These exist so that (a) Locals' Favourites and the hotel picker have
    authentic local options from the first run, and (b) anyone can sign
    into the business console with a demo account and see a populated
    dashboard rather than an empty state.
    """
    from .routers.business import _hash_password
    from .data.pune_locations import coords_for

    if db.query(models.Business).count() > 0:
        return

    demo = [
        dict(name="Kaka Halwai", category="Sweets & snacks", email="owner@kakahalwai.in",
             locality="Kasba Peth", address="Shop 14, Kasba Peth main lane, near Ganpati Mandir",
             capacity=40, capacity_unit="seats", cuisine="Maharashtrian sweets",
             signature_item="Warm pedha and kharvas", price_band="Low",
             tagline="Four generations of the same recipe, made fresh every morning.",
             segments=["Family", "Walk-in"], rating=4.6, is_verified=True,
             image_url="https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1024&q=70"),
        dict(name="Vaishali Restaurant", category="Café & restaurant", email="hello@vaishalipune.in",
             locality="FC Road", address="1218/1 FC Road, opposite Fergusson College",
             capacity=120, capacity_unit="seats", cuisine="South Indian & Maharashtrian",
             signature_item="SPDP and filter coffee", price_band="Low",
             tagline="The FC Road institution students have been queuing at since 1951.",
             segments=["Family", "Solo", "Groups"], rating=4.5, is_verified=True,
             image_url="https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=1024&q=70"),
        dict(name="Bhavani Mata Bhel House", category="Street food stall", email="bhavani.bhel@gmail.com",
             locality="Saras Baug", address="Stall 6, Sarasbaug food lane",
             capacity=20, capacity_unit="standing covers", cuisine="Chaat & bhel",
             signature_item="Sukha bhel with extra lasun chutney", price_band="Low",
             tagline="Evening-only bhel, made to order, eaten standing up.",
             segments=["Family", "Walk-in", "Groups"], rating=4.4,
             image_url="https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=1024&q=70"),
        dict(name="Peth Haveli Homestay", category="Homestay / guest house", email="stay@pethhaveli.in",
             locality="Kasba Peth", address="Wada 22, Kasba Peth, off Shivaji Road",
             capacity=6, capacity_unit="rooms", price_per_night=1800, price_band="Moderate",
             tagline="Six rooms in a restored 90-year-old wada, run by the family that grew up in it.",
             segments=["Couples", "Solo", "Pre-booked"], rating=4.7, is_verified=True,
             image_url="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1024&q=70"),
        dict(name="Sahyadri Trails & Guides", category="Guide & tour operator", email="walk@sahyadritrails.in",
             locality="Kothrud", address="Office 3, Paud Road, Kothrud",
             capacity=12, capacity_unit="people per walk",
             signature_item="Sunrise Vetal Tekdi walk", price_band="Moderate",
             tagline="Licensed local guides running heritage and hill walks in Marathi, Hindi and English.",
             segments=["Groups", "Solo", "Pre-booked"], rating=4.8, is_verified=True,
             image_url="https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1024&q=70"),
        dict(name="Tulshibaug Copper & Brass", category="Artisan & handicrafts", email="shop@tulshibaugbrass.in",
             locality="Budhwar Peth", address="Lane 4, Tulshibaug market",
             capacity=15, capacity_unit="visitors", signature_item="Hand-beaten brass diyas",
             price_band="Low",
             tagline="Hand-beaten copper and brass, made in the workshop behind the shop.",
             segments=["Family", "Walk-in"], rating=4.3,
             image_url="https://images.unsplash.com/photo-1582582494705-f8ce0b0c24f0?auto=format&fit=crop&w=1024&q=70"),
    ]

    password_hash = _hash_password(DEMO_PASSWORD)
    rows = []
    for d in demo:
        coord = coords_for(d["locality"]) or (18.5204, 73.8567)
        rows.append(models.Business(
            password_hash=password_hash, lat=coord[0], lon=coord[1],
            hours="09:00-22:00", is_listed=True, **d
        ))
    db.add_all(rows)
    db.commit()
