"""
Simple debug test for auto-alerts endpoint logic
"""
import pandas as pd
import os

# Test loading the CSV
print("Testing CSV loading...")
csv_path = os.path.join(os.path.dirname(__file__), "water_dataX.csv")
print(f"CSV path: {csv_path}")
print(f"File exists: {os.path.exists(csv_path)}")

try:
    df = pd.read_csv(csv_path)
    print(f"\n✓ CSV loaded successfully!")
    print(f"Shape: {df.shape}")
    print(f"\nColumns: {df.columns.tolist()}")
    print(f"\nFirst few rows:")
    print(df.head())
    
    # Test column renaming
    print("\n\nTesting column renaming...")
    df_renamed = df.rename(columns={
        'STATION CODE': 'station_id',
        'LOCATIONS': 'location',
        'STATE': 'state',
        'Temp': 'temperature',
        'PH': 'ph',
    })
    print(f"Renamed columns: {df_renamed.columns.tolist()}")
    
    # Test numeric conversion
    print("\n\nTesting numeric conversion...")
    df_renamed['ph'] = pd.to_numeric(df_renamed['ph'], errors='coerce')
    df_renamed['temperature'] = pd.to_numeric(df_renamed['temperature'], errors='coerce')
    
    if 'B.O.D.' in df_renamed.columns:
        df_renamed['turbidity'] = pd.to_numeric(df_renamed['B.O.D.'], errors='coerce')
    else:
        df_renamed['turbidity'] = 0.0
    
    print(f"pH stats:\n{df_renamed['ph'].describe()}")
    print(f"\nTemperature stats:\n{df_renamed['temperature'].describe()}")
    print(f"\nTurbidity stats:\n{df_renamed['turbidity'].describe()}")
    
    # Fill NaN
    df_renamed['ph'] = df_renamed['ph'].fillna(7.0)
    df_renamed['temperature'] = df_renamed['temperature'].fillna(25.0)
    df_renamed['turbidity'] = df_renamed['turbidity'].fillna(0.0)
    
    print("\n\n✓ All data processing successful!")
    print(f"\nSample processed data:")
    print(df_renamed[['station_id', 'ph', 'temperature', 'turbidity']].head(10))
    
except Exception as e:
    print(f"\n✗ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
