import sys

with open('app.py', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

replacement = '''@app.post("/api/stations/{station_id}/readings")
def create_reading(
    station_id: int,
    reading: StationReadingCreate,
    current_user: User = Depends(require_role(["admin", "authority", "ngo"])),
    db: Session = Depends(get_db)
):
    station = db.query(WaterStation).filter(WaterStation.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    
    db_reading = StationReading(
        station_id=station_id,
        parameter=reading.parameter,
        value=reading.value
    )
    db.add(db_reading)
    db.commit()
    db.refresh(db_reading)
    
    # Predictive Analytics integration
    from services.predictive_engine import predict_future_value
    prediction = predict_future_value(db, station_id, reading.parameter, reading.value)
    
    if prediction.get("alert_flag"):
        alert_type = AlertType.CONTAMINATION.value
        # Additional context logic
        if "temperature" in reading.parameter.lower() and float(reading.value) > 100:
            alert_type = AlertType.BOIL_NOTICE.value
            
        alert = Alert(
            type=alert_type,
            message=prediction["alert_message"],
            location=station.location,
            source="predictive"
        )
        db.add(alert)
        db.commit()
        
    return {
        "id": getattr(db_reading, 'id', 0),
        "station_id": station_id,
        "parameter": reading.parameter,
        "value": reading.value,
        "recorded_at": getattr(db_reading, 'recorded_at', None),
        "current_value": reading.value,
        "predicted_value": prediction.get("predicted_value"),
        "confidence": prediction.get("confidence_score"),
        "alert": prediction.get("alert_message", "")
    }'''

pattern_start = '@app.post("/api/stations/{station_id}/readings", response_model=StationReadingResponse)'
pattern_end_str = 'db.refresh(db_reading)\\n    return db_reading'

# Find the LAST occurrence because of many commented out versions
start_idx = content.rfind(pattern_start)
if start_idx == -1:
    print("Could not find pattern_start")
    sys.exit(1)
    
end_idx = content.find(pattern_end_str, start_idx) + len(pattern_end_str)

new_content = content[:start_idx] + replacement + content[end_idx:]
with open('app.py', 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Successfully replaced create_reading endpoint")
