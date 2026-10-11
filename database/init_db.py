import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

DB_NAME = "ai_audit_db"
DB_USER = "audit_user"
DB_PASS = "audit_pass123"
ADMIN_USER = "postgres"
ADMIN_PASS = os.getenv("PGPASSWORD", "1111")

def init_db():
    conn = psycopg2.connect(host="localhost", user=ADMIN_USER, password=ADMIN_PASS, dbname="postgres")
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()
    cur.execute("SELECT 1 FROM pg_database WHERE datname=%s", (DB_NAME,))
    if not cur.fetchone():
        cur.execute(f"CREATE DATABASE {DB_NAME}")
    cur.execute("SELECT 1 FROM pg_roles WHERE rolname=%s", (DB_USER,))
    if not cur.fetchone():
        cur.execute(f"CREATE USER {DB_USER} WITH PASSWORD %s", (DB_PASS,))
    cur.execute(f"GRANT ALL PRIVILEGES ON DATABASE {DB_NAME} TO {DB_USER}")
    cur.close()
    conn.close()
    conn = psycopg2.connect(host="localhost", user=DB_USER, password=DB_PASS, dbname=DB_NAME)
    cur = conn.cursor()
    cur.execute("CREATE SCHEMA IF NOT EXISTS raw")
    cur.execute("CREATE SCHEMA IF NOT EXISTS audit")
    cur.execute("CREATE TABLE IF NOT EXISTS raw.accounts (account_id VARCHAR(50) PRIMARY KEY, account_type VARCHAR(30), balance DECIMAL(15,2) DEFAULT 0, risk_level VARCHAR(20) DEFAULT 'low', created_at TIMESTAMP DEFAULT NOW())")
    cur.execute("CREATE TABLE IF NOT EXISTS raw.transactions (transaction_id VARCHAR(50) PRIMARY KEY, account_id VARCHAR(50) REFERENCES raw.accounts(account_id), timestamp TIMESTAMP NOT NULL, amount DECIMAL(15,2) NOT NULL, category VARCHAR(50), is_anomaly BOOLEAN DEFAULT FALSE, anomaly_type VARCHAR(30), created_at TIMESTAMP DEFAULT NOW())")
    cur.execute("CREATE TABLE IF NOT EXISTS audit.anomalies (anomaly_id SERIAL PRIMARY KEY, transaction_id VARCHAR(50) REFERENCES raw.transactions(transaction_id), anomaly_score DECIMAL(5,4), is_suspicious BOOLEAN, severity VARCHAR(20), detected_at TIMESTAMP DEFAULT NOW())")
    conn.commit()
    cur.close()
    conn.close()
    print("[OK] Database initialized")

if __name__ == "__main__":
    init_db()
