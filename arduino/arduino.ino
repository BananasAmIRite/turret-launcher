#include <ArduinoJson.h>
#include <Arduino.h>
#include "Motor.h"

#define X_MOTOR_PIN 1
#define X_MOTOR_ENC1 2
#define X_MOTOR_ENC2 3
#define X_MOTOR_TPR 360 // TODO: change
#define X_MOTOR_P 1
#define X_MOTOR_I 0
#define X_MOTOR_D 0

#define Y_MOTOR_PIN 3
#define Y_MOTOR_ENC1 4
#define Y_MOTOR_ENC2 5
#define Y_MOTOR_TPR 360 // TODO: change
#define Y_MOTOR_P 1
#define Y_MOTOR_I 0
#define Y_MOTOR_D 0

Motor* mX; 
Motor* mY; 

void setup()
{

    Serial.begin(9600);

	mX = new Motor(
            X_MOTOR_PIN, 
            X_MOTOR_ENC1, X_MOTOR_ENC2, 
            X_MOTOR_TPR, 
            X_MOTOR_P, X_MOTOR_I, X_MOTOR_D
        ); 

    mY = new Motor(
            Y_MOTOR_PIN, 
            Y_MOTOR_ENC1, Y_MOTOR_ENC2, 
            Y_MOTOR_TPR, 
            Y_MOTOR_P, Y_MOTOR_I, Y_MOTOR_D
        ); 
}

void loop()
{
    mX->motorLoop();
    mY->motorLoop(); 


    if (Serial.available()) 
  {
    StaticJsonDocument<300> doc;

    DeserializationError err = deserializeJson(doc, Serial);

    if (err == DeserializationError::Ok) 
    {
      const char* action = doc["action"]; 
      if (action == "rotateX") {
          StaticJsonDocument<300> payload = doc["payload"]; 
          double rotation = payload["rotation"]; 
          boolean rotateTo = payload["rotateTo"]; 
          if (rotateTo) {
              mX->turnTo(rotation); 
          } else mX->turn(rotation); 
      } else if (action == "rotateY") {
          StaticJsonDocument<300> payload = doc["payload"]; 
          double rotation = payload["rotation"]; 
          boolean rotateTo = payload["rotateTo"]; 
          if (rotateTo) {
              mY->turnTo(rotation); 
          } else mY->turn(rotation); 
      }
    } 
  }
}

void testEncoders() {
    Serial.write(mX->readEncoder() + " " + mY->readEncoder()); 
}