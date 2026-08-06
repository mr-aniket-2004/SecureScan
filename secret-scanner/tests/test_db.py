from src.db.database import engine, Base
from src.db.models import ScanJob, ScanFinding

print("[*] Connecting to Supabase PostgreSQL database...")
try:
    Base.metadata.create_all(bind=engine)
    print("[+] Success! Created 'scan_jobs' and 'scan_findings' tables in Supabase.")
except Exception as e:
    print(f"[!] Database connection failed: {e}")