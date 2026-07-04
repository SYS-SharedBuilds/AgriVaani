import time
import requests
import random

API_ENDPOINT = "http://localhost:3000/v1/sensors/SIM800_DEV_01/telemetry"

def simulate_telemetry():
    print(f"Starting telemetry replay to {API_ENDPOINT}")
    base_ph = 6.5
    try:
        while True:
            # Simulate realistic drift
            ph = round(base_ph + random.uniform(-0.5, 0.5), 2)
            
            # 10% chance to simulate a sudden drop/spike indicating an issue
            if random.random() > 0.9:
                ph = round(ph + random.choice([-2.0, 2.0]), 2)
                
            payload = {
                "soil_ph": ph,
                "transport": "gprs"
            }
            
            try:
                response = requests.post(API_ENDPOINT, json=payload)
                if response.status_code == 200:
                    print(f"[OK] Sent pH: {ph}")
                else:
                    print(f"[ERROR] API responded with {response.status_code}")
            except requests.exceptions.ConnectionError:
                print("[ERROR] Connection to Orchestration API failed. Is it running?")
                
            time.sleep(15)  # Send every 15 seconds for demo
    except KeyboardInterrupt:
        print("\nTelemetry replay stopped.")

if __name__ == "__main__":
    simulate_telemetry()
