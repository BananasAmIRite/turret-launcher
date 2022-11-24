#include "PID.h"

PID::PID(float p, float i, float d) {
    this->p = p; 
    this->i = i; 
    this->d = d; 
}

void PID::reset() {
    error = 0; 
    errorInt = 0;
    lastError = 0; 
    lastTime = 0;
}

float PID::updatePID(float error) {
    time_t lastLastTime = lastTime; 
    lastTime = now(); 

    if (lastTime == 0) return 0; 

    time_t deltaTime = lastTime - lastLastTime; 
    errorInt += error * deltaTime; 

    lastError = this->error; 
    this->error = error; 

    float errorDeriv = (error - lastError) / deltaTime; 

    return p * error + i * errorInt + d * errorDeriv; 
}