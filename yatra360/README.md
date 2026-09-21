# Yatra360

Pune travel and city-intelligence platform, with a local-business console
built into the same application.

Two audiences, one data model:

* **Tourists** plan trips, compare routes, avoid crowds and find local places.
* **Businesses** see the crowd around them and get told what to do about it.

Both read the same places-and-crowd model, which is the point: the crowd
that makes a tourist avoid Shaniwar Wada at 17:00 is the same crowd that
tells a Kasba Peth sweet shop to put its board out.

---

## Running locally

### Backend

```bash
cd yatra360-backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Serves on `http://localhost:8000`. Interactive API docs at `/docs`.
On first start it creates `yatra360.db` (SQLite) and seeds places,
hotels, emergency contacts, parking and six demo businesses.

### Frontend

```bash
cd yatra360-frontend
npm install
npm run dev
```

Serves on `http://localhost:5173`.

> `npm install` is required after pulling this version — `leaflet`,
> `react-leaflet` and `recharts` are new dependencies. The map will not
> render without them.

---

## Routes

| Path | What it is |
| --- | --- |
| `/` | Landing page (pre-login) |
| `/login`, `/role` | Sign in and role choice |
| `/onboarding` | My Trip |
| `/itinerary` | Itinerary + Locals' Favourites |
| `/mobility` | Transit & Routes |
| `/safety-weather` | Weather & Safety |
| `/crowd` | Quieter Alternatives |
| `/city-reports` | City Alerts & Parking |
| `/business/login`, `/business/register` | Business console auth |
| `/business/app/crowd` | Crowd & opportunity dashboard |
| `/business/app/opportunities` | Opportunity alerts |
| `/business/app/analytics` | Profile views, peak demand |
| `/business/app/profile` | Listing editor |

### Demo business account

```
owner@kakahalwai.in / yatra360demo
```

A Kasba Peth sweet shop, so its radius contains Shaniwar Wada and
Dagdusheth and the dashboard loads populated.

---

## How the two sides connect

1. A business registers (10 categories: cafes, stays, guides, artisans,
   transport, workshops...).
2. Stays appear in the tourist hotel picker, **sorted above** the seeded
   listings. Food businesses appear in Locals' Favourites on the
   Itinerary page.
3. When a tourist sees a listing, a `BusinessView` row is written.
4. The owner's Analytics tab reads those rows: views over time, by
   source, by hour.
5. The Crowd & opportunity dashboard scores nearby attractions and
   generates prompts — *"Shaniwar Wada is high right now; push your
   sweets menu"* — each labelled with the signal behind it.

---

## Backend layout

```
app/
  data/pune_locations.py    60 locations + coordinates, grouped
  services/routing.py       multi-modal route comparison + polylines
  services/intelligence.py  crowd curves, forecasts, opportunities, alerts
  services/recommendation.py  itinerary matching
  routers/locations.py      /api/locations, /api/routes/compare
  routers/business.py       console + public local listings
  routers/hotels.py         seeded hotels merged with registered stays
```

---

## Honest limits

* Crowd levels are **modelled**, not live tracked — derived from each
  place's demand band, the hour and the day of week.
* Route lines are plausible curves, not turn-by-turn navigation. Metro
  legs do follow the real Aqua and Purple line station order. Swap
  `road_geometry()` in `services/routing.py` for an OSRM or Mapbox
  Directions call to make them real.
* Business auth uses PBKDF2 plus a signed opaque token. Fine for a
  prototype; move to the Supabase JWT flow before real accounts exist.
* Place photos are remote URLs. Any that fail fall back to a generated
  monogram tile, so the layout never breaks.
