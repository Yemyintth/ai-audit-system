import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

DB = {"host": "localhost", "user": "audit_user", "password": "audit_pass123", "dbname": "ai_audit_db"}

def cleanup():
    conn = psycopg2.connect(**DB)
    cur = conn.cursor()
    
    # Get counts BEFORE
    cur.execute("SELECT COUNT(*) FROM raw.transactions")
    before = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM raw.accounts")
    accounts = cur.fetchone()[0]
    
    print(f"BEFORE: {before:,} transactions, {accounts:,} accounts")
    
    # Delete duplicate transactions (keep only one per transaction_id)
    cur.execute("""
        DELETE FROM raw.transactions a
        USING raw.transactions b
        WHERE a.ctid < b.ctid AND a.transaction_id = b.transaction_id
    """)
    deleted_txns = cur.rowcount
    print(f"Deleted {deleted_txns:,} duplicate transactions")
    
    # Delete duplicate accounts
    cur.execute("""
        DELETE FROM raw.accounts a
        USING raw.accounts b
        WHERE a.ctid < b.ctid AND a.account_id = b.account_id
    """)
    deleted_accounts = cur.rowcount
    print(f"Deleted {deleted_accounts:,} duplicate accounts")
    
    # Delete duplicate anomalies
    cur.execute("""
        DELETE FROM audit.anomalies a
        USING audit.anomalies b
        WHERE a.ctid < b.ctid AND a.transaction_id = b.transaction_id
    """)
    deleted_anomalies = cur.rowcount
    print(f"Deleted {deleted_anomalies:,} duplicate anomalies")
    
    conn.commit()
    
    # Get counts AFTER
    cur.execute("SELECT COUNT(*) FROM raw.transactions")
    after = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM raw.accounts")
    accounts_after = cur.fetchone()[0]
    
    print(f"AFTER: {after:,} transactions, {accounts_after:,} accounts")
    
    cur.close()
    conn.close()
    print("[OK] Cleanup complete")

if __name__ == "__main__":
    cleanup()
