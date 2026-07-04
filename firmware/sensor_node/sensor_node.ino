// AgriVaani Sensor Node Firmware
// Target: Arduino Mega 2560
// Hardware: GSM Module (SIM800L/900), analog pH sensor, 4-channel relay module

#include <SoftwareSerial.h>

#define PH_SENSOR_PIN A0
#define RELAY_1 2 // Irrigation Pump
#define RELAY_2 3 // Fertigation Valve A
#define RELAY_3 4 // Fertigation Valve B
#define RELAY_4 5 // Spare / Buzzer
#define OVERRIDE_SWITCH 6 // Local manual override

#define MAX_RUNTIME_MS 1800000 // 30 minutes max runtime for safety

SoftwareSerial gsm(10, 11); // RX, TX
String deviceId = "SIM800_DEV_01";
String apiEndpoint = "http://api.agrivaani.com/v1/sensors/";
String serverPhone = "+910000000000";

unsigned long relay1_startTime = 0;
bool relay1_active = false;

void setup() {
  Serial.begin(9600);
  gsm.begin(9600);
  
  pinMode(RELAY_1, OUTPUT);
  pinMode(RELAY_2, OUTPUT);
  pinMode(RELAY_3, OUTPUT);
  pinMode(RELAY_4, OUTPUT);
  pinMode(OVERRIDE_SWITCH, INPUT_PULLUP);
  
  // Active LOW relays, turn them off initially
  digitalWrite(RELAY_1, HIGH);
  digitalWrite(RELAY_2, HIGH);
  digitalWrite(RELAY_3, HIGH);
  digitalWrite(RELAY_4, HIGH);
  
  Serial.println("AgriVaani Sensor Node Initialized.");
}

float readPH() {
  int total = 0;
  for(int i=0; i<10; i++) {
    total += analogRead(PH_SENSOR_PIN);
    delay(10);
  }
  float avg = total / 10.0;
  float voltage = avg * (5.0 / 1023.0);
  // Calibration formula (approximate)
  float ph = 3.5 * voltage;
  return ph;
}

void loop() {
  // 1. Safety Check: Max Runtime Cutoff
  if (relay1_active && (millis() - relay1_startTime > MAX_RUNTIME_MS)) {
    digitalWrite(RELAY_1, HIGH); // Turn OFF
    relay1_active = false;
    Serial.println("SAFETY CUTOFF: Relay 1 turned off after 30 mins.");
  }
  
  // 2. Safety Check: Local Override (takes precedence)
  if (digitalRead(OVERRIDE_SWITCH) == LOW) {
    if (!relay1_active) {
      digitalWrite(RELAY_1, LOW); // Turn ON manually
      relay1_active = true;
      relay1_startTime = millis();
      Serial.println("LOCAL OVERRIDE ACTIVE. Pump ON.");
    }
  } else {
      // Local override released, could turn off if we want, 
      // but typically we let remote commands take over or auto cutoff
  }
  
  // 3. Read Sensors
  float ph = readPH();
  Serial.print("Current pH: ");
  Serial.println(ph);
  
  // 4. Send Telemetry via GPRS (Stubbed HTTP POST)
  Serial.println("Connecting to GPRS...");
  bool gprsSuccess = true; // Assume success for demo logic
  if (gprsSuccess) {
    Serial.println("HTTP POST: {\"soil_ph\": " + String(ph) + "}");
    
    // 5. Poll Commands via GPRS
    Serial.println("HTTP GET: /commands");
    // Pseudo-code: parse response, actuate relay
    // if response == "ON"
    //   digitalWrite(RELAY_1, LOW); relay1_active = true; relay1_startTime = millis();
  } else {
    // 6. GPRS Fallback to SMS
    Serial.println("GPRS failed. Sending SMS fallback.");
    String smsPayload = "AGV," + deviceId + ",PH:" + String(ph);
    Serial.println("SMS: " + smsPayload);
  }
  
  delay(15000); // Poll every 15 seconds for testing purposes (real: 15 mins)
}
