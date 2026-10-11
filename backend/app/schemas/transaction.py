from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TransactionBase(BaseModel):
    transaction_id: str
    account_id: str
    timestamp: datetime
    amount: float
    category: Optional[str] = None

class TransactionResponse(TransactionBase):
    is_anomaly: bool = False
    class Config:
        from_attributes = True

class AnomalyResponse(BaseModel):
    anomaly_id: int
    transaction_id: str
    anomaly_score: float
    is_suspicious: bool
    severity: str
    class Config:
        from_attributes = True
