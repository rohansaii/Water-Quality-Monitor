"""
Test script for Auto Predictive Alerts endpoint
"""
import requests
import json

def test_auto_alerts():
    """Test the /api/auto-alerts endpoint"""
    try:
        print("Testing Auto Predictive Alerts endpoint...")
        print("=" * 60)
        
        # Make request to endpoint
        response = requests.get("http://localhost:5000/api/auto-alerts", timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print()
        
        if response.status_code == 200:
            data = response.json()
            
            print("✓ Endpoint is working!")
            print()
            print(f"Total Stations Analyzed: {data.get('total_stations_analyzed', 0)}")
            print(f"Total Alerts Generated: {data.get('total_alerts_generated', 0)}")
            print(f"Model Used: {data.get('model_used', 'Unknown')}")
            print(f"Generated At: {data.get('generated_at', 'N/A')}")
            print()
            
            alerts = data.get('alerts', [])
            if alerts:
                print(f"\n📊 Found {len(alerts)} alerts:")
                print("-" * 60)
                
                for i, alert in enumerate(alerts[:5], 1):  # Show first 5 alerts
                    print(f"\nAlert #{i}:")
                    print(f"  Station ID: {alert.get('station_id', 'N/A')}")
                    print(f"  Alert Type: {alert.get('alert_type', 'N/A')}")
                    print(f"  Severity: {alert.get('severity', 'N/A')}")
                    print(f"  Predicted pH: {alert.get('predicted_ph', 'N/A')}")
                    print(f"  Risk Score: {alert.get('risk_score', 'N/A')}")
                    print(f"  Timestamp: {alert.get('timestamp', 'N/A')}")
            else:
                print("\n⚠️  No alerts generated (all parameters within safe limits)")
            
            print("\n" + "=" * 60)
            print("✅ Test completed successfully!")
            
        else:
            print(f"✗ Error: Received status code {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.Timeout:
        print("✗ Error: Request timed out (took more than 30 seconds)")
    except requests.exceptions.ConnectionError:
        print("✗ Error: Could not connect to server. Is the backend running on http://localhost:5000?")
    except Exception as e:
        print(f"✗ Error: {str(e)}")

if __name__ == "__main__":
    test_auto_alerts()
