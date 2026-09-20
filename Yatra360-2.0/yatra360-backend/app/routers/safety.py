from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/safety", tags=["safety"])


@router.get("/emergency-contacts", response_model=List[schemas.EmergencyContactOut])
def get_emergency_contacts(db: Session = Depends(get_db)):
    return db.query(models.EmergencyContact).all()


@router.get("/weather", response_model=schemas.WeatherOut)
def get_weather(location: str = "Pune"):
    # Mocked for the prototype -- swap for IMD or a licensed weather API.
    # Keep the "estimated"/"sample" labeling honest until a real source
    # is wired in (see project guardrail: don't overclaim data quality).
    return schemas.WeatherOut(
        location=location,
        condition="Light rain expected in the afternoon",
        temp_c=24,
        humidity=78,
        advisory="Outdoor/walking-heavy stops are best scheduled before 1 PM.",
    )
