#include "Motor.h"

Motor::Motor(int motorPin, uint8_t encPin1, uint8_t encPin2, int ticksPerRotation, float p, float i, float d, float ff) : encoder(encPin1, encPin2), pid(p, i, d, ff) {
    this->ticksPerRotation = ticksPerRotation;
    this->motorPin = motorPin; 

    // setup motor
    pinMode(motorPin, OUTPUT); 

}; 

void Motor::turnTo(double degrees) {
    int ticks = (int) (degrees * ticksPerRotation); 

    targetPosition = (reversedCoeff) * ticks; 
}

void Motor::turn(double degrees) {
    int ticks = (int) (degrees * ticksPerRotation); 

    targetPosition = encoder.read() + (reversedCoeff) * ticks; 
}

void Motor::motorLoop() {
    int error = targetPosition - encoder.read(); 

    double val = pid.updatePID(error); 

    analogWrite(motorPin, val); 
}

int32_t Motor::readEncoder() {
    return encoder.read(); 
}

void Motor::resetEncoder() {
    encoder.write(0); 
}

void Motor::setReversed(bool reversed) {
    this->reversedCoeff = reversed ? -1 : 1; 
    resetEncoder(); 
}

bool Motor::isReversed() {
    return reversedCoeff == -1; 
}