from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.transaction import Transaction, Anomaly

router = APIRouter()

@router.get('/stats')
def stats(db: Session = Depends(get_db)):
    total = db.query(func.count(Transaction.transaction_id)).scalar() or 0
    suspicious = db.query(func.count(Anomaly.anomaly_id)).filter(Anomaly.is_suspicious == True).scalar() or 0
    total_amount = db.query(func.sum(Transaction.amount)).scalar() or 0
    return {'total_transactions': total, 'suspicious': suspicious, 'total_amount': float(total_amount), 'flag_rate': (suspicious / total * 100 if total else 0)}
