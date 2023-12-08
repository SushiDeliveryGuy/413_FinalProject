#include <Particle.h>
#include "DFRobot_MAX30102.h"
#include "algorithm.h"
#include "heartRate.h"

DFRobot_MAX30102 particleSensor;

enum State {
  IDLE,
  MEASURE,
};

State currentState = IDLE;
unsigned long lastMeasurementTime = 0;
unsigned long measurementInterval = 1800000 ;  // Default: 30 minutes

int startHour = 6;//default start 6am
int startMinute = 0;
int endHour = 22;//default end 10pm
int endMinute = 0;
unsigned long startTime = 0;
unsigned long currentTime = 0;
unsigned long elapsedTime = 0;

// Local storage for measurements (has a max so I dont run out of device space calculated for max measurements for default settings)
#define MAX_STORED_MEASUREMENTS 32
struct StoredMeasurement {
  String data;
  unsigned long timestamp;
};

StoredMeasurement storedMeasurements[MAX_STORED_MEASUREMENTS];
int storedMeasurementCount = 0;

void myHandler(const char *event, const char *data) {
    // Find the index of the "success" field
    const char *successStart = strstr(data, "\"success\":");
    
    if (successStart != NULL) {
        // Find the end of the "success" field
        const char *successEnd = strchr(successStart, ',');
        
        if (successEnd == NULL) {
            successEnd = strchr(successStart, '}');
        }
        
        if (successEnd != NULL) {
            // Extract the value of the "success" field
            successStart = strchr(successStart, ':') + 1;
            bool success = strncmp(successStart, "true", 4) == 0;

            if (success) {
                // Handle the case where "success" is true
                flashLedGreen();
            } 
        }
    }
}
void setup() {
    Serial.begin(115200);
    startTime = millis();  // Record the start time
    Particle.subscribe("hook-response/heartrate", myHandler, MY_DEVICES);
    Particle.function("setMeasurementParameters", configureMeasurementParameters);
    
    while (!particleSensor.begin()) {
        Serial.println("MAX30102 was not found");
        delay(1000);
    }
    
    
    particleSensor.sensorConfiguration(50, SAMPLEAVG_4, MODE_MULTILED, SAMPLERATE_100, PULSEWIDTH_411, ADCRANGE_16384);
}

int32_t SPO2; //SPO2
int8_t SPO2Valid; //Flag to display if SPO2 calculation is valid
int32_t heartRate; //Heart-rate
int8_t heartRateValid; //Flag to display if heart-rate calculation is valid 
unsigned long timeStarted = 0;

void loop() {
    currentTime = millis();
    elapsedTime = currentTime - startTime;
    
    delay(100);
    switch (currentState) {
    case IDLE:
        if (storedMeasurementCount != 0) {
            checkAndDeleteOldMeasurements();
            if (Particle.connected()) {
                for (int i = 0; i < storedMeasurementCount; i++) {
                    Particle.publish("heartrate", storedMeasurements[i].data, PRIVATE);
                }
                storedMeasurementCount = 0;  // Reset stored measurements
            }
        }
        
        if (isCurrentTimeInRange()) {
            if (millis() - lastMeasurementTime >= measurementInterval) {
                currentState = MEASURE;
            }
        }
        
    break;

    

    case MEASURE:
      // Perform the measurement
      
      particleSensor.heartrateAndOxygenSaturation(&SPO2, &SPO2Valid, &heartRate, &heartRateValid);
      timeStarted = millis();
      while (!SPO2Valid || !heartRateValid || heartRate < 0 || SPO2 < 0) {
          particleSensor.heartrateAndOxygenSaturation(&SPO2, &SPO2Valid, &heartRate, &heartRateValid);
          flashLedBlue();
          if (millis() - timeStarted >= 1800000 / 6) {//after 5 minutes go back to idle
              lastMeasurementTime = millis();
              currentState = IDLE;
              break;
          }
      }
      if (SPO2Valid && heartRateValid) {
          flashLedRed();
          for (int i = 0; i < 4; i++) {
              particleSensor.heartrateAndOxygenSaturation(&SPO2, &SPO2Valid, &heartRate, &heartRateValid);
          }
          if (Particle.connected()) {
              if (storedMeasurementCount > 0) {
                  for (int i = 0; i < storedMeasurementCount; i++) {
                    Particle.publish("heartrate", storedMeasurements[i].data, PRIVATE);
                  }
                  storedMeasurementCount = 0;  // Reset stored measurements
              }
              else {
                  String dataString = String(heartRate) + "," + String(SPO2);
                    Particle.publish("heartrate", String(dataString), PRIVATE);
                    flashLedGreen();
              }
           } else {
                if (storedMeasurementCount < MAX_STORED_MEASUREMENTS) {
                  StoredMeasurement newMeasurement;
                  newMeasurement.data = String(heartRate) + "," + String(SPO2);
                  newMeasurement.timestamp = millis();
                  storedMeasurements[storedMeasurementCount++] = newMeasurement;
                  flashLedYellow(); // data successfully stored locally
                }
            }
            lastMeasurementTime = millis();
            currentState = IDLE;
      }
      
      break;


    default:
      // Handle unexpected states
      break;
  }
}

void flashLedBlue() {
  
  // You can use the RGB.control() function to take control of the LED
  RGB.control(true);
  RGB.color(0, 0, 255); // Blue color
  delay(500); // Adjust the duration of the flash
  RGB.control(false); // Release control of the LED
}

void flashLedRed() {
  
  // You can use the RGB.control() function to take control of the LED
  RGB.control(true);
  RGB.color(255, 0, 0); // Red color
  delay(500); // Adjust the duration of the flash
  RGB.control(false); // Release control of the LED
}

void flashLedGreen() {
  
  // You can use the RGB.control() function to take control of the LED
  RGB.control(true);
  RGB.color(0, 255, 0); // green color
  delay(500); // Adjust the duration of the flash
  RGB.control(false); // Release control of the LED
}

void flashLedYellow() {
  
  // You can use the RGB.control() function to take control of the LED
  RGB.control(true);
  RGB.color(255, 255, 0); // yellow color
  delay(500); // Adjust the duration of the flash
  RGB.control(false); // Release control of the LED
}

void checkAndDeleteOldMeasurements() {
  unsigned long currentMillis = millis();
  for (int i = 0; i < storedMeasurementCount; i++) {
    if (currentMillis - storedMeasurements[i].timestamp >= 86400000) {  // 24 hours in milliseconds
      // Delete old measurement
      for (int j = i; j < storedMeasurementCount - 1; j++) {
        storedMeasurements[j] = storedMeasurements[j + 1];
      }
      storedMeasurementCount--;
      i--;  // Recheck the current index since we moved elements
    }
  }
}

int configureMeasurementParameters(const char *data) {
  char startTimeStr[6], endTimeStr[6];
  int frequency;

  if (sscanf(data, "%5[^-]-%5[^,],%d", startTimeStr, endTimeStr, &frequency) == 3) {
    // Successfully parsed the input data
    startHour = atoi(startTimeStr);
    startMinute = atoi(startTimeStr + 3);
    endHour = atoi(endTimeStr);
    endMinute = atoi(endTimeStr + 3);
    measurementInterval = frequency * 60 * 1000;  // Convert frequency to milliseconds

    currentState = IDLE;  // Reset the state
    return 1;  // Success
  } else {
    // Failed to parse the input data
    return -1;  // Error
  }
}

bool isCurrentTimeInRange() {
  // Get the current time in minutes since midnight
  int currentTime = Time.hour() * 60 + Time.minute();

  // Check if the current time is within the specified range
  return (currentTime >= startHour * 60 + startMinute) && (currentTime <= endHour * 60 + endMinute);
}
