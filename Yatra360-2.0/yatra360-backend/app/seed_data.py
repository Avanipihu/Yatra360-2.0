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
        ),
        models.Place(
            id="aga-khan-palace", name="Aga Khan Palace", category="History",
            lat=18.5525, lon=73.9012, open_hours="9:00 AM \u2013 5:30 PM",
            cost="Low", estimated_demand="Moderate",
            accessibility=["Minimal walking", "Elderly-friendly", "Child-friendly"],
            good_for=["Family", "Senior citizens", "Solo"],
            description="Spacious heritage grounds linked to Gandhi\u2019s internment; quieter alternative to central-city forts.",
            source="ASI Pune Circle", last_verified=date(2026, 8, 10),
        ),
        models.Place(
            id="sinhagad-fort", name="Sinhagad Fort", category="Adventure",
            lat=18.3664, lon=73.7550, open_hours="Open 24 hours (visits recommended 7 AM \u2013 6 PM)",
            cost="Low", estimated_demand="High",
            accessibility=[],
            good_for=["Friends", "Couple"],
            description="Hilltop fort with trekking trails and panoramic Sahyadri views; steep walking required.",
            source="Pune District Tourism", last_verified=date(2026, 8, 1),
        ),
        models.Place(
            id="dagdusheth-temple", name="Dagdusheth Halwai Ganpati Temple", category="Spiritual",
            lat=18.5164, lon=73.8553, open_hours="6:00 AM \u2013 11:30 PM",
            cost="Free", estimated_demand="High",
            accessibility=["Minimal walking", "Child-friendly"],
            good_for=["Family", "Solo", "Senior citizens"],
            description="One of Pune\u2019s most visited temples, especially crowded on weekends and festival days.",
            source="Pune Municipal Corporation (PMC)", last_verified=date(2026, 8, 14),
        ),
        models.Place(
            id="tulshibaug-ram-mandir", name="Tulshibaug Ram Mandir & Market", category="Local experiences",
            lat=18.5158, lon=73.8547, open_hours="8:00 AM \u2013 9:00 PM",
            cost="Free", estimated_demand="Moderate",
            accessibility=["Child-friendly"],
            good_for=["Family", "Friends", "Solo"],
            description="A quieter spiritual stop next to a bustling local market \u2014 a lower-demand alternative near Dagdusheth.",
            source="PMC Heritage Cell", last_verified=date(2026, 8, 5),
        ),
        models.Place(
            id="osho-garden", name="Osho Teerth Park", category="Nature",
            lat=18.5362, lon=73.8935, open_hours="6:00 AM \u2013 9:00 PM",
            cost="Free", estimated_demand="Low",
            accessibility=["Minimal walking", "Elderly-friendly", "Wheelchair accessible", "Child-friendly"],
            good_for=["Family", "Senior citizens", "Solo"],
            description="A landscaped, low-crowd park \u2014 good for children and elderly travellers who need rest points.",
            source="PMC Garden Dept.", last_verified=date(2026, 7, 28),
        ),
        models.Place(
            id="phlox-cafe", name="Phlox Local Thali House", category="Food",
            lat=18.5100, lon=73.8300, open_hours="12:00 PM \u2013 10:30 PM",
            cost="Moderate", estimated_demand="Moderate",
            accessibility=["Child-friendly"],
            good_for=["Family", "Friends", "Solo"],
            description="Home-style Maharashtrian thali, popular with families for early dinners.",
            source="Curated (team-verified)", last_verified=date(2026, 8, 12),
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

    db.commit()

    # Crowd-alternative pairs need place PKs to already exist, so add after commit.
    alternatives = [
        models.PlaceAlternative(overcrowded_id="shaniwarwada", alternative_id="aga-khan-palace",
                                 shared_tag="Peshwa-era history, similar architecture"),
        models.PlaceAlternative(overcrowded_id="dagdusheth-temple", alternative_id="tulshibaug-ram-mandir",
                                 shared_tag="Spiritual experience, walking distance apart"),
    ]
    db.add_all(alternatives)
    db.commit()
