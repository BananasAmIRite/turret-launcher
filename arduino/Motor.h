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
        int reversedCoeff = 1; 

    public: 
        Motor(int motorPin, uint8_t encPin1, uint8_t encPin2, int ticksPerRotation, float p, float i, float d, float ff); 
        void turnTo(double degrees);
        void turn(double degrees);  
        void motorLoop(); 
        void resetEncoder(); 
        void setReversed(bool reversed); 
        bool isReversed(); 
        int32_t readEncoder(); 
}; 
