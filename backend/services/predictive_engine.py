"""
Predictive Engine using Linear Regression.
Provides real-time predictions and confidence scores for water quality parameters.
"""

from datetime import datetime, timedelta, timezone
from typing import List, Dict, Optional
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score

# WHO Water Quality Thresholds
WHO_THRESHOLDS = {
    "ph": {"min": 6.5, "max": 8.5, "unit": "pH"},
    "turbidity": {"max": 4.0, "unit": "NTU"},
    "dissolved_oxygen": {"min": 6.0, "unit": "mg/L"},
    "lead": {"max": 0.01, "unit": "mg/L"},
    "arsenic": {"max": 0.01, "unit": "mg/L"},
    "temperature": {"max": 35.0, "unit": "°C"},
    "e_coli": {"max": 0, "unit": "CFU/100mL"}
}

def predict_future_value(db_session, station_id: int, param_name: str, new_value: float) -> Dict:
    """
    Predict future value using Linear Regression with confidence scoring.
    Returns: { "predicted_value", "confidence_score", "alert_flag", "alert_message" }
    """
    # Inline import to avoid circular dependencies
    from app import StationReading
    
    # Standardize parameter name for checking Thresholds
    param_key = param_name.lower().replace(" ", "_")
    if param_key == "do":
        param_key = "dissolved_oxygen"
        
    # Fetch recent historical readings (last 10)
    historical_readings = db_session.query(StationReading).filter(
        StationReading.station_id == station_id,
        StationReading.parameter.ilike(param_name)
    ).order_by(StationReading.recorded_at.desc()).limit(10).all()
    
    # Sort chronological
    historical_readings.reverse()
    
    values = [float(r.value) for r in historical_readings]
    timestamps = [r.recorded_at.replace(tzinfo=timezone.utc) if r.recorded_at.tzinfo is None else r.recorded_at for r in historical_readings]
    
    # Append the current reading as the latest point
    values.append(float(new_value))
    timestamps.append(datetime.now(timezone.utc))
    
    # Need at least 3 points for a meaningful regression
    if len(values) < 3:
        return {
            "predicted_value": round(float(new_value), 3),
            "confidence_score": 0.0,
            "alert_flag": False,
            "alert_message": ""
        }
        
    try:
        # Convert timestamps to numeric (hours from first reading)
        time_diffs = [(t - timestamps[0]).total_seconds() / 3600.0 for t in timestamps]
        X = np.array(time_diffs).reshape(-1, 1)
        y = np.array(values)
        
        # Fit linear regression model
        model = LinearRegression()
        model.fit(X, y)
        
        # Predict future value (1 hour ahead of the latest reading)
        future_time = time_diffs[-1] + 1.0
        predicted_value = float(model.predict([[future_time]])[0])
        
        # Calculate R² score as confidence
        y_pred = model.predict(X)
        r2 = float(r2_score(y, y_pred))
        confidence_score = max(0.0, min(100.0, r2 * 100))  # Percentage 0-100
        
        # Determine trend
        slope = float(model.coef_[0])
        trend = "increasing" if slope > 0 else "decreasing"
        
        # Check thresholds and generate alert
        alert_flag = False
        alert_message = ""
        
        if param_key in WHO_THRESHOLDS:
            config = WHO_THRESHOLDS[param_key]
            
            if "max" in config and predicted_value > config["max"]:
                alert_flag = True
                alert_message = (
                    f"⚠️ {param_name} expected to exceed safe limit ({config['max']} {config['unit']}) "
                    f"in 1 hour."
                )
            elif "min" in config and predicted_value < config["min"]:
                alert_flag = True
                alert_message = (
                    f"⚠️ {param_name} expected to fall below safe limit ({config['min']} {config['unit']}) "
                    f"in 1 hour."
                )

        return {
            "predicted_value": round(predicted_value, 3),
            "confidence_score": round(confidence_score, 1),
            "alert_flag": alert_flag,
            "alert_message": alert_message
        }
        
    except Exception as e:
        return {
            "predicted_value": round(float(new_value), 3),
            "confidence_score": 0.0,
            "alert_flag": False,
            "alert_message": ""
        }
