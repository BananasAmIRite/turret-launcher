import * as cv from '@u4/opencv4nodejs';
import express from 'express';
import * as http from 'http';
import { Server } from 'socket.io';
import * as fs from 'fs';
import { Acknowledgment } from './types/types';
import LauncherCamera from './LauncherCamera';
import { SerialPort, SerialPortMock } from 'serialport';
import Launcher from './Launcher';

const app = express();
const httpServer = new http.Server(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

const handleError = async (f: () => any, cb: Acknowledgment) => {
  try {
    await f();
    cb({ success: true, response: null });
  } catch (err: any) {
    // console.log(err);

    cb({ success: false, error: err.message });
  }
};

(async () => {
  httpServer.listen(3030);
  const video = new cv.VideoCapture(0);

  const calibratedData = JSON.parse(
    fs.readFileSync('./out/calibration.json', {
      encoding: 'utf-8',
    })
  );

  const path = '/dev/test';
  SerialPortMock.binding.createPort(path);

  const launcher = new Launcher(new SerialPortMock({ path, baudRate: 9600 }));

  const launcherCamera = new LauncherCamera(video, calibratedData.mtx, calibratedData.distCoeffs, launcher, 10);

  io.on('connection', (socket) => {
    socket.on('turn', (data, callback: Acknowledgment) => {
      handleError(() => launcherCamera.turn(video.read()), callback);
    });

    socket.on('shoot', (data, callback: Acknowledgment) => {
      handleError(() => launcherCamera.shoot(), callback);
    });
  });

  launcher.onData((data) => io.emit('message', data));

  setInterval(() => {
    const frame = video.read();
    const detectedData = launcherCamera.detectBall(frame);
    if (detectedData) {
      frame.drawCircle(
        new cv.Point2(detectedData.pixelX, detectedData.pixelY),
        4,
        new cv.Vec3(255, 0, 0),
        5,
        cv.FILLED
      );
      frame.drawRectangle(
        new cv.Point2(detectedData.pixelX - detectedData.width / 2, detectedData.pixelY - detectedData.height / 2),
        new cv.Point2(detectedData.pixelX + detectedData.width / 2, detectedData.pixelY + detectedData.height / 2),
        new cv.Vec3(0, 0, 255),
        5
      );

      const position = launcherCamera.solveBallPosition(detectedData);
      io.emit('position', position);
    }

    io.emit('image', cv.imencode('.jpg', frame).toString('base64'));
    io.emit('data', detectedData);
  }, 100);
})();
