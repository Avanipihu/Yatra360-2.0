def seed_demo_businesses(db: Session):
    """
    Seeds a handful of registered local businesses.
    """

    from .data.pune_locations import coords_for
    from .routers.business import _hash_password

    if db.query(models.Business).count() > 0:
        return

    demo = [
        dict(
            name="Kaka Halwai",
            category="Sweets & snacks",
            email="owner@kakahalwai.in",
            locality="Kasba Peth",
            address="Shop 14, Kasba Peth main lane, near Ganpati Mandir",
            capacity=40,
            capacity_unit="seats",
            cuisine="Maharashtrian sweets",
            signature_item="Warm pedha and kharvas",
            price_band="Low",
            tagline="Four generations of the same recipe, made fresh every morning.",
            segments=["Family", "Walk-in"],
            rating=4.6,
            is_verified=True,
            image_url="https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1024&q=70",
        ),
        dict(
            name="Vaishali Restaurant",
            category="Café & restaurant",
            email="hello@vaishalipune.in",
            locality="FC Road",
            address="1218/1 FC Road, opposite Fergusson College",
            capacity=120,
            capacity_unit="seats",
            cuisine="South Indian & Maharashtrian",
            signature_item="SPDP and filter coffee",
            price_band="Low",
            tagline="The FC Road institution students have been queuing at since 1951.",
            segments=["Family", "Solo", "Groups"],
            rating=4.5,
            is_verified=True,
            image_url="https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=1024&q=70",
        ),
        dict(
            name="Bhavani Mata Bhel House",
            category="Street food stall",
            email="bhavani.bhel@gmail.com",
            locality="Saras Baug",
            address="Stall 6, Sarasbaug food lane",
            capacity=20,
            capacity_unit="standing covers",
            cuisine="Chaat & bhel",
            signature_item="Sukha bhel with extra lasun chutney",
            price_band="Low",
            tagline="Evening-only bhel, made to order, eaten standing up.",
            segments=["Family", "Walk-in", "Groups"],
            rating=4.4,
            image_url="https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=1024&q=70",
        ),
        dict(
            name="Peth Haveli Homestay",
            category="Homestay / guest house",
            email="stay@pethhaveli.in",
            locality="Kasba Peth",
            address="Wada 22, Kasba Peth, off Shivaji Road",
            capacity=6,
            capacity_unit="rooms",
            price_per_night=1800,
            price_band="Moderate",
            tagline="Six rooms in a restored 90-year-old wada, run by the family that grew up in it.",
            segments=["Couples", "Solo", "Pre-booked"],
            rating=4.7,
            is_verified=True,
            image_url="https://images.unsplash.com/photo-1682414180867-99b4b8d76a33?auto=format&fit=crop&w=1024&q=70",
        ),
        dict(
            name="Sahyadri Trails & Guides",
            category="Guide & tour operator",
            email="walk@sahyadritrails.in",
            locality="Kothrud",
            address="Office 3, Paud Road, Kothrud",
            capacity=12,
            capacity_unit="people per walk",
            signature_item="Sunrise Vetal Tekdi walk",
            price_band="Moderate",
            tagline="Licensed local guides running heritage and hill walks in Marathi, Hindi and English.",
            segments=["Groups", "Solo", "Pre-booked"],
            rating=4.8,
            is_verified=True,
            image_url="https://images.unsplash.com/photo-1720531294753-d9e3494a9460?auto=format&fit=crop&w=1024&q=70",
        ),
        dict(
            name="Tulshibaug Copper & Brass",
            category="Artisan & handicrafts",
            email="shop@tulshibaugbrass.in",
            locality="Budhwar Peth",
            address="Lane 4, Tulshibaug market",
            capacity=15,
            capacity_unit="visitors",
            signature_item="Hand-beaten brass diyas",
            price_band="Low",
            tagline="Hand-beaten copper and brass, made in the workshop behind the shop.",
            segments=["Family", "Walk-in"],
            rating=4.3,
            image_url="https://images.unsplash.com/photo-1703643004820-de1df4e058f2?auto=format&fit=crop&w=1024&q=70",
        ),
    ]

    password_hash = _hash_password(DEMO_PASSWORD)

    rows = []

    for d in demo:
        coord = coords_for(d["locality"]) or (18.5204, 73.8567)

        rows.append(
            models.Business(
                password_hash=password_hash,
                lat=coord[0],
                lon=coord[1],
                hours="09:00-22:00",
                is_listed=True,
                **d,
            )
        )

    db.add_all(rows)
    db.commit()
