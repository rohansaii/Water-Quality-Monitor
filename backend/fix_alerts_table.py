"""
Quick fix: Add station_id column to alerts table
Run this ONCE using the same Python that runs your backend
"""
from sqlalchemy import create_engine, text, inspect
import os

# Your database URL - adjust if needed based on your .env
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "watermonitor")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")

#DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
DATABASE_URL = "postgresql://postgres:3906DW82@localhost:5432/watermonitor"
print(f"Connecting to: {DATABASE_URL.replace(DB_PASSWORD, '***')}")

try:
    engine = create_engine(DATABASE_URL)
    inspector = inspect(engine)
    
    # Get current columns
    columns = [col['name'] for col in inspector.get_columns('alerts')]
    print(f"\nCurrent columns in alerts: {columns}")
    
    if 'station_id' in columns:
        print("\n✅ Column 'station_id' already exists!")
    else:
        print("\n⚠️  Adding 'station_id' column...")
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE alerts ADD COLUMN station_id INTEGER"))
            conn.commit()
            print("✅ Successfully added station_id column!")
            
            # Verify
            columns = [col['name'] for col in inspector.get_columns('alerts')]
            print(f"Updated columns: {columns}")

except Exception as e:
    print(f"\n❌ Error: {e}")
    print("\nMake sure:")
    print("1. PostgreSQL is running")
    print("2. Database 'watermonitor' exists")
    print("3. Credentials are correct (check your .env file)")
    
finally:
    engine.dispose()
    print("\nDone!")
