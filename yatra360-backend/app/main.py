from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import CORS_ORIGINS
from .database import Base, engine, SessionLocal
from .seed_data import seed_if_empty
from .routers import places, hotels, itinerary, mobility, safety, crowd, reports, parking

app = FastAPI(
    title="Yatra360 API",
    description="Backend for the Yatra360 tourist dashboard (inside-user-page module).",
    version="0.1.0",
)

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
