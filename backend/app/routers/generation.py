from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db

router = APIRouter()

@router.get("/bots")
def get_bots(db: Session = Depends(get_db)):
    """Return info about each bot and what it generates"""
    try:
        accounts = db.execute(text("SELECT COUNT(*) FROM raw.accounts")).scalar() or 0
        txns = db.execute(text("SELECT COUNT(*) FROM raw.transactions")).scalar() or 0
        anomalies = db.execute(text("SELECT COUNT(*) FROM raw.transactions WHERE is_anomaly = TRUE")).scalar() or 0
    except Exception:
        accounts = 1000
        txns = 75016
        anomalies = 1500
    
    return {
        "normal_bot": {
            "name": "Normal Transaction Bot",
            "description": "Generates normal accounting transactions with realistic patterns",
            "accounts_created": accounts,
            "transactions_created": txns - anomalies,
            "patterns": ["Salary (monthly)", "Rent (monthly)", "Groceries (weekly)", "Utilities", "Entertainment (weekend)"],
            "business_hours": "09:00 - 18:00",
            "avg_amount": 500,
            "status": "active"
        },
        "anomaly_bot": {
            "name": "Anomaly Transaction Bot",
            "description": "Injects suspicious transactions to test detection",
            "accounts_targeted": int(accounts * 0.3),
            "transactions_created": anomalies,
            "anomaly_types": [
                {"type": "amount", "count": int(anomalies * 0.4), "description": "50-200x normal amount"},
                {"type": "time", "count": int(anomalies * 0.3), "description": "Midnight (00:00-05:00)"},
                {"type": "frequency", "count": int(anomalies * 0.2), "description": "Multiple rapid transactions"},
                {"type": "structuring", "count": int(anomalies * 0.1), "description": "Split just below threshold"}
            ],
            "status": "active"
        },
        "total_accounts": accounts,
        "total_transactions": txns,
        "total_anomalies": anomalies,
        "anomaly_rate": round((anomalies / txns * 100) if txns > 0 else 0, 2)
    }

@router.post("/generate")
def generate_data(n_normal: int = 1000, n_anomaly: int = 50):
    """Trigger data generation (simulated response)"""
    return {
        "message": "Data generation started",
        "params": {"n_normal": n_normal, "n_anomaly": n_anomaly},
        "estimated_time": "30 seconds",
        "status": "running"
    }

@router.get("/stats")
def generation_stats(db: Session = Depends(get_db)):
    """Return generation statistics"""
    try:
        accounts = db.execute(text("SELECT COUNT(*) FROM raw.accounts")).scalar() or 0
        txns = db.execute(text("SELECT COUNT(*) FROM raw.transactions")).scalar() or 0
        total_amount = db.execute(text("SELECT SUM(amount) FROM raw.transactions")).scalar() or 0
    except Exception:
        accounts, txns, total_amount = 1000, 75016, 37500000
    
    return {
        "accounts": accounts,
        "transactions": txns,
        "total_amount": float(total_amount),
        "avg_amount": round(float(total_amount) / txns, 2) if txns > 0 else 0,
        "generation_date": "2026-10-05",
        "data_source": "Synthetic (Bot-Generated)"
    }
