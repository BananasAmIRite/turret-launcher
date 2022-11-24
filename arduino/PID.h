#pragma once
#include <TimeLib.h>

class PID {
    private:
        float p; 
        float i; 
        float d; 

        float error = 0; 
        float errorInt = 0; 
        float lastError = 0;
        time_t lastTime; 

    public: 
        PID(float p, float i, float d);
        void reset(); 
        float updatePID(float error); 
}; 