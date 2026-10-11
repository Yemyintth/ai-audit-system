from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db

router = APIRouter()

class ThresholdUpdate(BaseModel):
    anomaly_threshold: float = 0.7
    high_risk_threshold: float = 0.85
    default_method: str = "ensemble"

# Persistent settings table
def ensure_table(db: Session):
    try:
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS ml.settings (
                key VARCHAR(50) PRIMARY KEY,
                value VARCHAR(100),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        """))
        db.commit()
        # Insert defaults if not exist
        defaults = {
            "anomaly_threshold": "0.7",
            "high_risk_threshold": "0.85",
            "default_method": "ensemble",
        }
        for k, v in defaults.items():
            db.execute(text("INSERT INTO ml.settings (key, value) VALUES (:k, :v) ON CONFLICT (key) DO NOTHING"), {"k": k, "v": v})
        db.commit()
    except Exception as e:
        print("Table error:", e)

def get_setting(db: Session, key: str, default: str = "") -> str:
    try:
        r = db.execute(text("SELECT value FROM ml.settings WHERE key = :k"), {"k": key}).fetchone()
        return r[0] if r else default
    except Exception:
        return default

def set_setting(db: Session, key: str, value: str):
    try:
        db.execute(text("INSERT INTO ml.settings (key, value, updated_at) VALUES (:k, :v, NOW()) ON CONFLICT (key) DO UPDATE SET value = :v, updated_at = NOW()"), {"k": key, "v": value})
        db.commit()
    except Exception as e:
        db.rollback()
        print("Set error:", e)

@router.get("/status")
def system_status(db: Session = Depends(get_db)):
    ensure_table(db)
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        pass
    try:
        accounts = db.execute(text("SELECT COUNT(*) FROM raw.accounts")).scalar() or 0
        txns = db.execute(text("SELECT COUNT(*) FROM raw.transactions")).scalar() or 0
        anomalies = db.execute(text("SELECT COUNT(*) FROM audit.anomalies WHERE is_suspicious = TRUE")).scalar() or 0
    except Exception:
        accounts, txns, anomalies = 0, 0, 0
    return {
        "database": "connected" if db_ok else "disconnected",
        "ml_engine": "ready",
        "total_accounts": accounts,
        "total_transactions": txns,
        "total_anomalies": anomalies,
    }

@router.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    ensure_table(db)
    return {
        "anomaly_threshold": float(get_setting(db, "anomaly_threshold", "0.7")),
        "high_risk_threshold": float(get_setting(db, "high_risk_threshold", "0.85")),
        "default_method": get_setting(db, "default_method", "ensemble"),
    }

@router.post("/settings")
def update_settings(update: ThresholdUpdate, db: Session = Depends(get_db)):
    ensure_table(db)
    set_setting(db, "anomaly_threshold", str(update.anomaly_threshold))
    set_setting(db, "high_risk_threshold", str(update.high_risk_threshold))
    set_setting(db, "default_method", update.default_method)
    return {
        "message": "Settings saved to database",
        "settings": {
            "anomaly_threshold": update.anomaly_threshold,
            "high_risk_threshold": update.high_risk_threshold,
            "default_method": update.default_method,
        }
    }

@router.get("/system-info")
def system_info(db: Session = Depends(get_db)):
    ensure_table(db)
    try:
        accounts = db.execute(text("SELECT COUNT(*) FROM raw.accounts")).scalar() or 0
        txns = db.execute(text("SELECT COUNT(*) FROM raw.transactions")).scalar() or 0
        anomalies = db.execute(text("SELECT COUNT(*) FROM audit.anomalies")).scalar() or 0
        suspicious = db.execute(text("SELECT COUNT(*) FROM audit.anomalies WHERE is_suspicious = TRUE")).scalar() or 0
        total_amount = db.execute(text("SELECT SUM(amount) FROM raw.transactions")).scalar() or 0
    except Exception:
        accounts, txns, anomalies, suspicious, total_amount = 0, 0, 0, 0, 0
    return {
        "system": {"name": "AI Audit Risk Assessment System", "version": "5.1.0", "status": "running"},
        "data": {
            "accounts": accounts, "transactions": txns, "total_amount": float(total_amount),
            "anomalies_detected": anomalies, "suspicious": suspicious,
        },
        "database": {"host": "localhost", "port": 5432, "name": "ai_audit_db", "schemas": ["raw", "audit", "ml"]},
        "ml_engine": {
            "methods": ["isolation_forest", "one_class_svm", "autoencoder", "dbscan", "ensemble"],
            "features": ["amount", "hour", "day_of_week", "is_weekend", "amount_zscore"],
            "best_method": "ensemble", "worst_method": "dbscan",
        },
    }

@router.post("/clear-anomalies")
def clear_anomalies(db: Session = Depends(get_db)):
    try:
        db.execute(text("DELETE FROM audit.anomalies"))
        db.commit()
        return {"message": "All anomalies cleared"}
    except Exception as e:
        db.rollback()
        return {"error": str(e)}

@router.post("/reset-data")
def reset_data(db: Session = Depends(get_db)):
    try:
        db.execute(text("DELETE FROM audit.reviews"))
        db.execute(text("DELETE FROM audit.anomalies"))
        db.commit()
        return {"message": "Data reset complete"}
    except Exception as e:
        db.rollback()
        return {"error": str(e)}

@router.get("/health")
def health():
    return {"status": "healthy"}
