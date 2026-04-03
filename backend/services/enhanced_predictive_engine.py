"""
Enhanced Predictive Analytics Engine with Linear Regression.
Provides real-time predictions and confidence scores for water quality parameters.
"""

from datetime import datetime, timedelta, timezone
from typing import List, Dict, Optional
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score


# WHO Water Quality Thresholds
WHO_THRESHOLDS = {
    "ph": {"min": 6.5, "max": 8.5, "unit": "pH", "description": "Acidity/Alkalinity"},
    "turbidity": {"max": 4.0, "unit": "NTU", "description": "Water Clarity"},
    "dissolved_oxygen": {"min": 6.0, "unit": "mg/L", "description": "Dissolved Oxygen"},
    "lead": {"max": 0.01, "unit": "mg/L", "description": "Lead Concentration"},
    "arsenic": {"max": 0.01, "unit": "mg/L", "description": "Arsenic Concentration"},
    "temperature": {"max": 35.0, "unit": "°C", "description": "Water Temperature"},
    "e_coli": {"max": 0, "unit": "CFU/100mL", "description": "E. coli Bacteria"}
}


class EnhancedPredictiveEngine:
    """ML-powered prediction engine using Linear Regression"""
    
    def __init__(self):
        self.thresholds = WHO_THRESHOLDS
    
    def predict_parameter_value(
        self,
        values: List[float],
        timestamps: List[datetime],
        param: str,
        hours_ahead: int = 1
    ) -> Dict:
        """
        Predict future value using Linear Regression with confidence scoring.
        
        Args:
            values: Historical values (chronological order, min 3 points)
            timestamps: Corresponding datetimes
            param: Parameter name (for threshold checking)
            hours_ahead: Prediction horizon in hours
            
        Returns:
            Dictionary with prediction data and alert information
        """
        # Validate input
        if len(values) < 3 or len(timestamps) < 3:
            return {
                "predicted_value": None,
                "confidence_score": 0.0,
                "alert_flag": False,
                "alert_message": "Insufficient data for prediction (need ≥3 readings)",
                "trend": "unknown",
                "change_rate": 0.0
            }
        
        try:
            # Convert timestamps to numeric (hours from first reading)
            time_diffs = [(t - timestamps[0]).total_seconds() / 3600 for t in timestamps]
            X = np.array(time_diffs).reshape(-1, 1)
            y = np.array(values)
            
            # Fit linear regression model
            model = LinearRegression()
            model.fit(X, y)
            
            # Predict future value
            current_time = time_diffs[-1]
            future_time = current_time + hours_ahead
            predicted_value = model.predict([[future_time]])[0]
            
            # Calculate R² score as confidence
            y_pred = model.predict(X)
            r2 = r2_score(y, y_pred)
            confidence_score = max(0.0, min(1.0, r2))  # Clamp 0-1
            
            # Determine trend
            slope = model.coef_[0]
            if abs(slope) < 0.001:
                trend = "stable"
            elif slope > 0:
                trend = "increasing"
            else:
                trend = "decreasing"
            
            # Check thresholds and generate alert
            alert_flag = False
            alert_message = ""
            
            if param in self.thresholds:
                threshold_config = self.thresholds[param]
                
                # Check max threshold
                if "max" in threshold_config:
                    max_threshold = threshold_config["max"]
                    if predicted_value > max_threshold:
                        alert_flag = True
                        alert_message = (
                            f"⚠️ {param.upper()} expected to exceed safe limit ({max_threshold} {threshold_config['unit']}) "
                            f"in {hours_ahead} hour(s). Current trend: {trend}."
                        )
                    elif predicted_value > max_threshold * 0.9:
                        alert_flag = True
                        alert_message = (
                            f"⚠️ {param.upper()} approaching critical level. "
                            f"Predicted: {round(predicted_value, 2)} {threshold_config['unit']} "
                            f"(Threshold: {max_threshold} {threshold_config['unit']})."
                        )
                
                # Check min threshold
                if "min" in threshold_config:
                    min_threshold = threshold_config["min"]
                    if predicted_value < min_threshold:
                        alert_flag = True
                        alert_message = (
                            f"⚠️ {param.upper()} expected to fall below safe minimum ({min_threshold} {threshold_config['unit']}) "
                            f"in {hours_ahead} hour(s). Current trend: {trend}."
                        )
                    elif predicted_value < min_threshold * 1.1:
                        alert_flag = True
                        alert_message = (
                            f"⚠️ {param.upper()} approaching minimum threshold. "
                            f"Predicted: {round(predicted_value, 2)} {threshold_config['unit']} "
                            f"(Minimum: {min_threshold} {threshold_config['unit']})."
                        )
            
            return {
                "predicted_value": round(float(predicted_value), 3),
                "confidence_score": round(float(confidence_score), 2),
                "confidence_percentage": round(float(confidence_score * 100), 1),
                "alert_flag": alert_flag,
                "alert_message": alert_message if alert_flag else "No alerts predicted",
                "trend": trend,
                "change_rate": round(float(slope), 4),  # Change per hour
                "current_value": values[-1],
                "prediction_horizon_hours": hours_ahead,
                "data_points_used": len(values)
            }
            
        except Exception as e:
            return {
                "predicted_value": None,
                "confidence_score": 0.0,
                "alert_flag": False,
                "alert_message": f"Prediction error: {str(e)}",
                "trend": "error",
                "change_rate": 0.0
            }
    
    def get_prediction_with_visualization_data(
        self,
        values: List[float],
        timestamps: List[datetime],
        param: str,
        forecast_hours: int = 24
    ) -> Dict:
        """
        Generate prediction data suitable for chart visualization.
        
        Returns historical + predicted points for plotting.
        """
        if len(values) < 3:
            return {"historical": [], "predicted": [], "confidence_band": []}
        
        # Prepare data
        time_diffs = [(t - timestamps[0]).total_seconds() / 3600 for t in timestamps]
        X = np.array(time_diffs).reshape(-1, 1)
        y = np.array(values)
        
        # Fit model
        model = LinearRegression()
        model.fit(X, y)
        
        # Generate future points
        last_time = time_diffs[-1]
        future_times = [last_time + h for h in range(1, forecast_hours + 1)]
        X_future = np.array(future_times).reshape(-1, 1)
        y_pred = model.predict(X_future)
        
        # Calculate confidence intervals
        y_std = np.std(y)
        upper_bound = y_pred + 1.96 * y_std
        lower_bound = y_pred - 1.96 * y_std
        
        # Format for frontend
        base_time = timestamps[0]
        historical_data = [
            {"time": t.isoformat(), "value": v, "type": "actual"}
            for t, v in zip(timestamps, values)
        ]
        
        predicted_data = [
            {
                "time": (base_time + timedelta(hours=h)).isoformat(),
                "value": round(pred, 3),
                "type": "predicted",
                "upper_bound": round(upper, 3),
                "lower_bound": round(lower, 3)
            }
            for h, pred, upper, lower in zip(range(1, forecast_hours + 1), y_pred, upper_bound, lower_bound)
        ]
        
        return {
            "historical": historical_data,
            "predicted": predicted_data,
            "trend_line": predicted_data,
            "model_r2": round(r2_score(y, model.predict(X)), 2)
        }


def generate_realtime_prediction(
    current_value: float,
    recent_values: List[float],
    recent_timestamps: List[datetime],
    param: str
) -> Dict:
    """
    Generate real-time prediction when a new reading is submitted.
    
    This is the main function called from the API endpoint.
    """
    engine = EnhancedPredictiveEngine()
    
    # Include current value in prediction
    all_values = recent_values + [current_value]
    all_timestamps = recent_timestamps + [datetime.now(timezone.utc)]
    
    # Predict 1 hour ahead
    prediction = engine.predict_parameter_value(
        values=all_values,
        timestamps=all_timestamps,
        param=param,
        hours_ahead=1
    )
    
    return prediction


def get_who_thresholds() -> Dict:
    """Return WHO threshold configuration"""
    return WHO_THRESHOLDS.copy()
