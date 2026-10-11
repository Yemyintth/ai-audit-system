import random
from datetime import datetime, timedelta
import psycopg2

DB = {"host": "localhost", "user": "audit_user", "password": "audit_pass123", "dbname": "ai_audit_db"}
CAT = ["salary", "rent", "groceries", "utilities", "entertainment", "transfer", "invoice"]

def gen_acc(n=1000):
    return [{"id": f"ACC-{100000+i}", "type": random.choice(["individual", "business"]), "bal": round(random.uniform(1000, 100000), 2), "risk": random.choice(["low", "medium", "high"])} for i in range(n)]

def gen_txn(accs, days=30):
    t = []
    for a in accs:
        for d in range(days):
            date = datetime.now() - timedelta(days=days-d)
            for _ in range(random.randint(1, 4)):
                t.append({"id": f"TXN-{random.randint(1000000, 9999999)}", "acc": a["id"], "ts": date.replace(hour=random.randint(9, 18), minute=random.randint(0, 59)), "amt": round(random.gauss(500, 150), 2), "cat": random.choice(CAT), "anom": False, "atype": None})
    return t

def inject(t, rate=0.02):
    n = int(len(t) * rate)
    for _ in range(n):
        x = random.choice(t)
        at = random.choice(["amount", "time"])
        if at == "amount":
            x["amt"] = round(random.uniform(50000, 200000), 2)
        elif at == "time":
            x["ts"] = x["ts"].replace(hour=random.randint(0, 5))
        x["anom"] = True
        x["atype"] = at
    return t

def save(accs, txns):
    conn = psycopg2.connect(**DB)
    cur = conn.cursor()
    for a in accs:
        cur.execute("INSERT INTO raw.accounts (account_id,account_type,balance,risk_level) VALUES (%s,%s,%s,%s) ON CONFLICT DO NOTHING", (a["id"], a["type"], a["bal"], a["risk"]))
    for t in txns:
        cur.execute("INSERT INTO raw.transactions (transaction_id,account_id,timestamp,amount,category,is_anomaly,anomaly_type) VALUES (%s,%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING", (t["id"], t["acc"], t["ts"], t["amt"], t["cat"], t["anom"], t["atype"]))
    conn.commit()
    cur.close()
    conn.close()
    print(f"[OK] Saved {len(accs)} accounts, {len(txns)} txns")

if __name__ == "__main__":
    a = gen_acc(1000)
    t = gen_txn(a, 30)
    t = inject(t, 0.02)
    save(a, t)
