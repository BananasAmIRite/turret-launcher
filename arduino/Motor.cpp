#include "Motor.h"

Motor::Motor(int motorPin, uint8_t encPin1, uint8_t encPin2, int ticksPerRotation, float p, float i, float d) : encoder(encPin1, encPin2), pid(p, i, d) {
    this->ticksPerRotation = ticksPerRotation;
    this->motorPin = motorPin; 

    pinMode(motorPin, OUTPUT); 
    // setup motor

}; 

void Motor::turnTo(double degrees) {
    int ticks = (int) (degrees * ticksPerRotation); 

    targetPosition = ticks; 
}

void Motor::turn(double degrees) {
    int ticks = (int) (degrees * ticksPerRotation); 

    targetPosition = encoder.read() + ticks; 
}

void Motor::motorLoop() {
    int error = targetPosition - encoder.read(); 

    double val = pid.updatePID(error); 

    analogWrite(motorPin, val); 
}

int32_t Motor::readEncoder() {
    return encoder.read(); 
}