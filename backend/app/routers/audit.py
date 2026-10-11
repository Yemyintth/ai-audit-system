from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db

router = APIRouter()

class ReviewUpdate(BaseModel):
    status: str
    comment: str = ''
    reviewer: str = 'auditor'

@router.get("/history")
def review_history(filter: str = "all", search: str = "", db: Session = Depends(get_db)):
    """Get review queue with filters"""
    try:
        q = "SELECT a.anomaly_id, a.transaction_id, a.anomaly_score, a.is_suspicious, a.severity, t.amount, t.timestamp, t.category FROM audit.anomalies a LEFT JOIN raw.transactions t ON a.transaction_id = t.transaction_id WHERE 1=1"
        params = {}
        
        if filter == "suspicious":
            q += " AND a.is_suspicious = TRUE"
        elif filter == "normal":
            q += " AND (a.is_suspicious = FALSE OR a.is_suspicious IS NULL)"
        elif filter == "critical":
            q += " AND a.severity = 'critical'"
        elif filter == "high":
            q += " AND a.severity IN ('high', 'critical')"
        elif filter == "medium":
            q += " AND a.severity = 'medium'"
        elif filter == "low":
            q += " AND a.severity = 'low'"
        
        if search:
            q += " AND (a.transaction_id ILIKE :s OR t.account_id ILIKE :s)"
            params["s"] = "%" + search + "%"
        
        q += " ORDER BY a.anomaly_score DESC LIMIT 200"
        rows = db.execute(text(q), params).fetchall()
        
        return [{
            "anomaly_id": r[0],
            "transaction_id": r[1],
            "anomaly_score": float(r[2]) if r[2] else 0,
            "is_suspicious": r[3],
            "severity": r[4],
            "amount": float(r[5]) if r[5] else 0,
            "timestamp": str(r[6]) if r[6] else None,
            "category": r[7],
        } for r in rows]
    except Exception as e:
        return {"error": str(e), "history": []}

@router.get("/detail/{transaction_id}")
def review_detail(transaction_id: str, db: Session = Depends(get_db)):
    """Full detail for audit review"""
    try:
        t = db.execute(text("SELECT transaction_id, account_id, amount, timestamp, category, is_anomaly FROM raw.transactions WHERE transaction_id = :tid"), {"tid": transaction_id}).fetchone()
        a = db.execute(text("SELECT anomaly_score, is_suspicious, severity FROM audit.anomalies WHERE transaction_id = :tid ORDER BY detected_at DESC LIMIT 1"), {"tid": transaction_id}).fetchone()
        
        if not t:
            return {"error": "Not found"}
        
        return {
            "transaction": {
                "transaction_id": t[0],
                "account_id": t[1],
                "amount": float(t[2]) if t[2] else 0,
                "timestamp": str(t[3]),
                "category": t[4],
                "is_anomaly": t[5],
            },
            "anomaly": {
                "score": float(a[0]) if a and a[0] else 0,
                "is_suspicious": a[1] if a else False,
                "severity": a[2] if a else "normal",
            } if a else None,
        }
    except Exception as e:
        return {"error": str(e)}

@router.post("/review/{transaction_id}")
def save_review(transaction_id: str, update: ReviewUpdate, db: Session = Depends(get_db)):
    try:
        db.execute(text("CREATE TABLE IF NOT EXISTS audit.reviews (id SERIAL PRIMARY KEY, transaction_id VARCHAR(50), status VARCHAR(30), comment TEXT, reviewer VARCHAR(50), reviewed_at TIMESTAMP DEFAULT NOW())"))
        db.execute(text("INSERT INTO audit.reviews (transaction_id, status, comment, reviewer) VALUES (:tid, :st, :cm, :rv)"),
                   {"tid": transaction_id, "st": update.status, "cm": update.comment, "rv": update.reviewer})
        db.commit()
        return {"message": "Review saved", "transaction_id": transaction_id, "status": update.status}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reviews")
def get_reviews(db: Session = Depends(get_db)):
    try:
        db.execute(text("CREATE TABLE IF NOT EXISTS audit.reviews (id SERIAL PRIMARY KEY, transaction_id VARCHAR(50), status VARCHAR(30), comment TEXT, reviewer VARCHAR(50), reviewed_at TIMESTAMP DEFAULT NOW())"))
        db.commit()
        rows = db.execute(text("SELECT id, transaction_id, status, comment, reviewer, reviewed_at FROM audit.reviews ORDER BY reviewed_at DESC LIMIT 100")).fetchall()
        return [{"id": r[0], "transaction_id": r[1], "status": r[2], "comment": r[3], "reviewer": r[4], "reviewed_at": str(r[5])} for r in rows]
    except Exception as e:
        return []

@router.get("/stats")
def audit_stats(db: Session = Depends(get_db)):
    try:
        total = db.execute(text("SELECT COUNT(*) FROM audit.anomalies")).scalar() or 0
        high = db.execute(text("SELECT COUNT(*) FROM audit.anomalies WHERE severity IN ('high', 'critical')")).scalar() or 0
        suspicious = db.execute(text("SELECT COUNT(*) FROM audit.anomalies WHERE is_suspicious = TRUE")).scalar() or 0
        return {"total": total, "high_risk": high, "suspicious": suspicious, "pending": suspicious, "reviewed": 0}
    except Exception:
        return {"total": 0, "high_risk": 0, "suspicious": 0, "pending": 0, "reviewed": 0}
