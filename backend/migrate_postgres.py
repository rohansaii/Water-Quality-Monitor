"""
PostgreSQL Migration Script for Alert Table
Adds station_id column to alerts table
"""
import os
from sqlalchemy import create_engine, text, inspect
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/watermonitor")

def migrate():
    """Add station_id column to alerts table if it doesn't exist"""
    
    try:
        # Create engine
        engine = create_engine(DATABASE_URL)
        
        # Check if column exists
        inspector = inspect(engine)
        columns = [col['name'] for col in inspector.get_columns('alerts')]
        
        print(f"Current columns in alerts table: {columns}")
        
        if 'station_id' in columns:
            print("✅ Column 'station_id' already exists in alerts table")
            return
        
        # Add station_id column
        with engine.connect() as conn:
            print("Adding station_id column to alerts table...")
            
            # Execute ALTER TABLE
            conn.execute(text("""
                ALTER TABLE alerts 
                ADD COLUMN station_id INTEGER
            """))
            
            # Commit the transaction
            conn.commit()
            
            print("✅ Successfully added station_id column to alerts table")
            
            # Verify
            columns = [col['name'] for col in inspector.get_columns('alerts')]
            print(f"Updated columns: {columns}")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise
    
    finally:
        engine.dispose()
        print("\nMigration complete!")

if __name__ == "__main__":
    migrate()
