from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("", response_model=List[schemas.CityReportOut])
def list_reports(db: Session = Depends(get_db)):
    return db.query(models.CityReport).order_by(models.CityReport.created_at.desc()).all()


@router.post("", response_model=schemas.CityReportOut)
def create_report(report_in: schemas.CityReportIn, db: Session = Depends(get_db)):
    report = models.CityReport(**report_in.model_dump())
    db.add(report)
    db.commit()
    db.refresh(report)
    return report
