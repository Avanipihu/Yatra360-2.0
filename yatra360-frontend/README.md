# Yatra360 — Tourist Dashboard (Inside User Page)

This is the "inside user page" of Yatra360: the tourist-facing dashboard a
user sees after logging in. It's built as a standalone React + Vite app so
it can be dropped into the shared repo once the frontpage/login and business
dashboard are ready, and later wired to the FastAPI backend.

## Running it

```bash
npm install
npm run dev
```

Opens on `http://localhost:5173`. `npm run build` produces a production
bundle in `dist/`.

## What's here

All data currently comes from `src/data/mockData.js` — swap these arrays
for real FastAPI calls later; the shapes are already close to a PostgreSQL
schema (`Place`, `Hotel`, `RouteOption`, `EmergencyContact`, `Report`,
`ParkingSpot`) so the migration should mostly be "replace the import with
a `fetch`/`axios` call."

| Route | Module | Owner |
|---|---|---|
| `/` | Trip profile form + hotel need/selection | Person 1 |
| `/itinerary` | Day-by-day plan generated from the trip profile | Person 1 |
| `/mobility?to=<placeId>` | Route comparison (Bus+Metro / Auto / Cab / Walk) + OSM map | Person 2 |
| `/safety-weather` | Weather + verified emergency contacts | Person 3 |
| `/crowd` | Overcrowded → alternative destination swaps | Person 4 |
| `/city-reports` | Issue reporting + parking intelligence | Person 5 |

All five pages share one `TripContext` (`src/context/TripContext.jsx`) so
the itinerary, crowd flags, and mobility links all stay in sync instead of
each page keeping its own separate state.

### Itinerary → Mobility handoff

Every itinerary stop has a "Directions →" button that links to
`/mobility?to=<placeId>`. The mobility page reads that query param to know
which destination to build a route comparison for.

### Estimated demand, not live tracking

`estimatedDemand` on each place is deliberately labelled "Estimated Demand"
throughout the UI (see `DemandTag`), per the project's own guardrail:
never claim real-time crowd tracking without an actual live data source.

## Next steps for backend integration

1. Replace `src/data/mockData.js` exports with API calls (FastAPI +
   PostgreSQL) behind a thin `src/api/` layer — keep the same shapes so
   components don't need to change.
2. Real hotel data: swap the sample `HOTELS` array for a verified source
   (government tourism API) or a curated table once available; `source`
   field is already there for the "verified/sample" badge pattern.
3. Auth: this app assumes the user is already logged in (comes after the
   frontpage/login module). Wrap `<App />` with whatever auth context that
   team produces.
4. Route comparison and demand numbers are mocked — replace with the
   ML/ranking logic once Person 4/5's recommendation engine is ready.
