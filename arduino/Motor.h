#pragma once
#include <Encoder.h>
#include "PID.h"

class Motor {
    private: 
        Encoder encoder;
        PID pid; 
        int ticksPerRotation;  
        int targetPosition = 0; 
        int motorPin; 

    public: 
        Motor(int motorPin, uint8_t encPin1, uint8_t encPin2, int ticksPerRotation, float p, float i, float d); 
        void turnTo(double degrees);
        void turn(double degrees);  
        void motorLoop(); 
        int32_t readEncoder(); 
}; 
