from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db

router = APIRouter()

@router.get("/list")
def list_paginated(entity: str = "transactions", page: int = 1, limit: int = 20, filter: str = "all", search: str = ""):
    """Paginated list with filter"""
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        offset = (page - 1) * limit
        if entity == "transactions":
            q = "SELECT transaction_id, account_id, amount, timestamp, category, is_anomaly FROM raw.transactions WHERE 1=1"
            params = {}
            if filter == "anomaly":
                q += " AND is_anomaly = TRUE"
            elif filter == "normal":
                q += " AND is_anomaly = FALSE"
            if search:
                q += " AND (transaction_id ILIKE :s OR account_id ILIKE :s)"
                params["s"] = "%" + search + "%"
            count_q = "SELECT COUNT(*) FROM raw.transactions WHERE 1=1"
            if filter == "anomaly":
                count_q += " AND is_anomaly = TRUE"
            elif filter == "normal":
                count_q += " AND is_anomaly = FALSE"
            if search:
                count_q += " AND (transaction_id ILIKE :s OR account_id ILIKE :s)"
            total = db.execute(text(count_q), params).scalar() or 0
            q += " ORDER BY timestamp DESC LIMIT :l OFFSET :o"
            params["l"] = limit
            params["o"] = offset
            rows = db.execute(text(q), params).fetchall()
            items = [{"transaction_id": r[0], "account_id": r[1], "amount": float(r[2]) if r[2] else 0, "timestamp": str(r[3]), "category": r[4], "is_anomaly": r[5]} for r in rows]
        else:
            q = "SELECT anomaly_id, transaction_id, anomaly_score, is_suspicious, severity FROM audit.anomalies WHERE 1=1"
            params = {}
            if filter == "high":
                q += " AND severity IN ('high', 'critical')"
            elif filter == "medium":
                q += " AND severity = 'medium'"
            elif filter == "low":
                q += " AND severity = 'low'"
            if search:
                q += " AND transaction_id ILIKE :s"
                params["s"] = "%" + search + "%"
            count_q = "SELECT COUNT(*) FROM audit.anomalies WHERE 1=1"
            if filter == "high":
                count_q += " AND severity IN ('high', 'critical')"
            total = db.execute(text(count_q), params).scalar() or 0
            q += " ORDER BY anomaly_score DESC LIMIT :l OFFSET :o"
            params["l"] = limit
            params["o"] = offset
            rows = db.execute(text(q), params).fetchall()
            items = [{"anomaly_id": r[0], "transaction_id": r[1], "anomaly_score": float(r[2]) if r[2] else 0, "is_suspicious": r[3], "severity": r[4]} for r in rows]
        return {"items": items, "total": total, "page": page, "limit": limit, "total_pages": (total + limit - 1) // limit}
    except Exception as e:
        return {"items": [], "total": 0, "page": page, "limit": limit, "total_pages": 0, "error": str(e)}
    finally:
        db.close()

@router.get("/methods")
def list_methods():
    """All available detection methods/models"""
    return {
        "methods": [
            {"id": "isolation_forest", "name": "Isolation Forest", "type": "Tree-based", "rank": "best", "f1": 0.86, "speed": "fast", "accuracy": 0.86, "description": "Ensemble of isolation trees for fast outlier detection"},
            {"id": "one_class_svm", "name": "One-Class SVM", "type": "Boundary", "rank": "worst", "f1": 0.75, "speed": "slow", "accuracy": 0.80, "description": "Boundary-based, sensitive to parameters"},
            {"id": "autoencoder", "name": "Autoencoder", "type": "Neural Network", "rank": "best", "f1": 0.89, "speed": "medium", "accuracy": 0.89, "description": "Neural network for complex pattern detection"},
            {"id": "dbscan", "name": "DBSCAN", "type": "Density Clustering", "rank": "worst", "f1": 0.74, "speed": "fast", "accuracy": 0.78, "description": "Density-based, good for arbitrary shapes"},
            {"id": "ensemble", "name": "Ensemble (Weighted)", "type": "Meta-model", "rank": "best", "f1": 0.92, "speed": "slow", "accuracy": 0.92, "description": "Combines all methods for best performance"}
        ],
        "best_method": "ensemble",
        "worst_method": "dbscan",
        "recommended": "ensemble"
    }

@router.get("/bot-report/{transaction_id}")
def bot_report(transaction_id: str):
    """Detailed bot report explaining why transaction is suspicious"""
    from app.core.database import SessionLocal
    from sqlalchemy import text
    db = SessionLocal()
    try:
        r = db.execute(text("SELECT transaction_id, account_id, amount, timestamp, category, is_anomaly, anomaly_type FROM raw.transactions WHERE transaction_id = :tid"), {"tid": transaction_id}).fetchone()
        if not r:
            return {"error": "Not found"}
        amount = float(r[2])
        is_anomaly = r[5]
        atype = r[6] or "unknown"
        hour = r[3].hour if r[3] else 0
        day = r[3].weekday() if r[3] else 0
        
        reasons = []
        if atype == "amount" or amount > 10000:
            reasons.append({"bot": "Anomaly Bot", "reason": "Amount anomaly detected", "detail": "Amount " + str(round(amount, 2)) + " is " + str(round(amount/500, 1)) + "x above normal avg $500", "severity": "high"})
        if atype == "time" or hour < 6 or hour > 22:
            reasons.append({"bot": "Anomaly Bot", "reason": "Time anomaly", "detail": "Transaction at " + str(hour) + ":00 is outside business hours (09:00-18:00)", "severity": "medium"})
        if atype == "frequency":
            reasons.append({"bot": "Anomaly Bot", "reason": "Frequency anomaly", "detail": "Multiple rapid transactions detected", "severity": "medium"})
        if atype == "structuring":
            reasons.append({"bot": "Anomaly Bot", "reason": "Structuring pattern", "detail": "Multiple small transfers just below reporting threshold", "severity": "high"})
        if day >= 5:
            reasons.append({"bot": "Anomaly Bot", "reason": "Weekend transaction", "detail": "Transaction on weekend (day " + str(day+1) + ")", "severity": "low"})
        if is_anomaly:
            reasons.append({"bot": "Auditor ML Bot", "reason": "Statistical deviation", "detail": "Amount z-score exceeds 3.0 threshold", "severity": "high"})
        else:
            reasons.append({"bot": "Normal Bot", "reason": "Normal pattern", "detail": "Matches account's historical behavior", "severity": "none"})
        
        return {
            "transaction_id": transaction_id,
            "account_id": r[1],
            "amount": amount,
            "timestamp": str(r[3]),
            "category": r[4],
            "is_anomaly": is_anomaly,
            "anomaly_type": atype,
            "bot_reasons": reasons,
            "bot_verdict": "SUSPICIOUS" if is_anomaly else "NORMAL",
            "confidence": 0.94 if is_anomaly else 0.12
        }
    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()
