import sys
sys.path.insert(0, ".")
from app.ml.auditor_bot import AuditorMLBot
from app.core.database import SessionLocal
from app.models.transaction import Transaction, Anomaly
import pandas as pd

db = SessionLocal()
txns = db.query(Transaction).limit(5000).all()
print(f"Loaded {len(txns)} transactions")

df = pd.DataFrame([
    {"transaction_id": t.transaction_id, "amount": float(t.amount), "timestamp": t.timestamp}
    for t in txns
])

bot = AuditorMLBot()
bot.fit(df)
result = bot.detect(df)

suspicious_count = int(result["suspicious"].sum())
print(f"Detected {suspicious_count} anomalies out of {len(result)}")

for _, row in result.iterrows():
    db.add(Anomaly(
        transaction_id=row["transaction_id"],
        anomaly_score=float(row["score"]),
        is_suspicious=bool(row["suspicious"]),
        severity="high" if row["suspicious"] else "normal"
    ))

db.commit()
db.close()
print("Saved to DB")
