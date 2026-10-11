from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.transaction import Anomaly
from app.schemas.transaction import AnomalyResponse

router = APIRouter()

@router.get("/", response_model=List[AnomalyResponse])
def list_anomalies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Anomaly).filter(Anomaly.is_suspicious == True).offset(skip).limit(limit).all()

@router.get("/all")
def list_all_anomalies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    rows = db.query(Anomaly).order_by(Anomaly.anomaly_score.desc()).offset(skip).limit(limit).all()
    return [{
        "anomaly_id": r.anomaly_id,
        "transaction_id": r.transaction_id,
        "anomaly_score": float(r.anomaly_score) if r.anomaly_score else 0,
        "is_suspicious": r.is_suspicious,
        "severity": r.severity,
    } for r in rows]

@router.get("/stats")
def anomaly_stats(db: Session = Depends(get_db)):
    total = db.query(Anomaly).count()
    suspicious = db.query(Anomaly).filter(Anomaly.is_suspicious == True).count()
    critical = db.query(Anomaly).filter(Anomaly.severity == "critical").count()
    high = db.query(Anomaly).filter(Anomaly.severity == "high").count()
    medium = db.query(Anomaly).filter(Anomaly.severity == "medium").count()
    low = db.query(Anomaly).filter(Anomaly.severity == "low").count()
    return {
        "total": total,
        "suspicious": suspicious,
        "critical": critical,
        "high": high,
        "medium": medium,
        "low": low,
    }
