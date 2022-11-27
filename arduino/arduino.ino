#include <ArduinoJson.h>
#include <Arduino.h>
#include <Servo.h>
#include "Motor.h"

#define X_MOTOR_PIN 1
#define X_MOTOR_ENC1 2
#define X_MOTOR_ENC2 3
#define X_MOTOR_TPR 192 // TODO: change
#define X_MOTOR_P 1
#define X_MOTOR_I 0
#define X_MOTOR_D 0
#define X_MOTOR_FF 0

#define Y_SERVO1_PIN 4
#define Y_SERVO2_PIN 5
// #define Y_MOTOR_ENC1 4
// #define Y_MOTOR_ENC2 5
// #define Y_MOTOR_TPR 192 
// #define Y_MOTOR_P 1
// #define Y_MOTOR_I 0
// #define Y_MOTOR_D 0

#define SHOOT_MOTOR_PIN 6
#define SHOOT_MOTOR_ENC1 7
#define SHOOT_MOTOR_ENC2 8
#define SHOOT_MOTOR_TPR 192 // TODO: change
#define SHOOT_MOTOR_P 0
#define SHOOT_MOTOR_I 0
#define SHOOT_MOTOR_D 0
#define SHOOT_MOTOR_FF 128

Motor* mX; 
Servo mY1; 
Servo mY2; 
Motor* shooter; 

void setup() {
    Serial.begin(9600);

	mX = new Motor(
            X_MOTOR_PIN, 
            X_MOTOR_ENC1, X_MOTOR_ENC2, 
            X_MOTOR_TPR, 
            X_MOTOR_P, X_MOTOR_I, X_MOTOR_D, X_MOTOR_FF
        ); 
    mY1.attach(Y_SERVO1_PIN);
    mY2.attach(Y_SERVO2_PIN);  

    shooter = new Motor(
            SHOOT_MOTOR_PIN, 
            SHOOT_MOTOR_ENC1, SHOOT_MOTOR_ENC2, 
            SHOOT_MOTOR_TPR, 
            SHOOT_MOTOR_P, SHOOT_MOTOR_I, SHOOT_MOTOR_D, SHOOT_MOTOR_FF
        );  // dunno yet but might need to reverse these depending on orientation

    // mY = new Motor(
    //         Y_MOTOR_PIN, 
    //         Y_MOTOR_ENC1, Y_MOTOR_ENC2, 
    //         Y_MOTOR_TPR, 
    //         Y_MOTOR_P, Y_MOTOR_I, Y_MOTOR_D
    //     ); 
}

void loop() {
    mX->motorLoop(); 
    shooter->motorLoop(); 

    if (Serial.available()) {
        readSerial(); 
    }
}

void testEncoders() {
    Serial.write(mX->readEncoder()); 
}

void readSerial() {
     StaticJsonDocument<300> doc;

    DeserializationError err = deserializeJson(doc, Serial);

    if (err == DeserializationError::Ok) {
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
              mY1.write(rotation); 
              mY2.write(rotation);
          } else {
              mY1.write(mY1.read() + rotation); 
              mY2.write(mY2.read() + rotation); 
          }
      } else if (action == "shoot") {
          shooter->resetEncoder(); 
          shooter->turn(360); 
      }
    }
}