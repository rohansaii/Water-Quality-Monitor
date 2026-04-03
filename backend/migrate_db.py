import sqlite3
import os

db_path = r"c:\Users\rohan\OneDrive\Desktop\WQI\water-quality-monitor\backend\watermonitor.db"

def migrate():
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Get current columns
    cursor.execute("PRAGMA table_info(alerts)")
    columns = [col[1] for col in cursor.fetchall()]
    print(f"Current columns: {columns}")

    needed_columns = [
        ("station_id", "INTEGER"),
        ("type", "VARCHAR(50)"),
        ("location", "VARCHAR(200)"),
        ("source", "VARCHAR(50) DEFAULT 'manual'"),
        ("issued_at", "DATETIME"), # In case it's named 'timestamp' in existing db
        ("is_resolved", "BOOLEAN DEFAULT 0")
    ]

    for col_name, col_type in needed_columns:
        if col_name not in columns:
            print(f"Adding column {col_name}...")
            try:
                cursor.execute(f"ALTER TABLE alerts ADD COLUMN {col_name} {col_type}")
            except Exception as e:
                print(f"Error adding {col_name}: {e}")
        else:
            print(f"Column {col_name} already exists.")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
