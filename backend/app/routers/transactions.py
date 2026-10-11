from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionResponse

router = APIRouter()

@router.get('/', response_model=List[TransactionResponse])
def list_txns(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Transaction).offset(skip).limit(limit).all()
