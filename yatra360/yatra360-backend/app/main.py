from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import CORS_ORIGINS
from .database import Base, engine, SessionLocal
from .seed_data import seed_if_empty
from .routers import (
    places, hotels, itinerary, mobility, safety, crowd, reports, parking,
    locations, business,
)

app = FastAPI(
    title="Yatra360 API",
    description=(
        "Backend for Yatra360 \u2014 the tourist dashboard and the local-business console, "
        "sharing one places/crowd model."
    ),
    version="0.2.0",
)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Yatra360 Smart Mobility API",
    # ... existing FastAPI parameters ...
)

# Add CORS middleware right here:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your Render frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ... rest of your routes and startup logic ...

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(places.router)
app.include_router(hotels.router)
app.include_router(itinerary.router)
app.include_router(mobility.router)
app.include_router(safety.router)
app.include_router(crowd.router)
app.include_router(reports.router)
app.include_router(parking.router)
app.include_router(locations.router)
app.include_router(business.router)
app.include_router(business.public_router)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
