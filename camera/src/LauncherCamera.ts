import * as cv from '@u4/opencv4nodejs';
import Camera, { CameraData, DetectionData, PnPObjectData } from './Camera';
import Launcher from './Launcher';

const GRAVITY = 9.81;

export default class LauncherCamera extends Camera {
  private static OBJECT_DATA: PnPObjectData = { width: 0.055, height: 0.15 };

  public constructor(
    capture: cv.VideoCapture,
    cameraData: CameraData,
    distCoeffs: number[],
    private launcher: Launcher,
    private shootingVelocity: number
  ) {
    super(capture, cameraData, distCoeffs);
  }

  getAngleToBall(frame: cv.Mat) {
    const detectedData = this.detectBall(frame);
    if (!detectedData) throw new Error('No target detected');
    const position = this.solveBallPosition(detectedData);
    if (!position) throw new Error('No target detected');

    return Math.atan(position.x / position.z);
  }

  getAngleToShoot(frame: cv.Mat) {
    const detectedData = this.detectBall(frame);
    if (!detectedData) throw new Error('No target detected');
    const position = this.solveBallPosition(detectedData);
    if (!position) throw new Error('No target detected');

    return Math.atan(
      (this.shootingVelocity ** 2 -
        Math.sqrt(this.shootingVelocity ** 4 - (GRAVITY * position.z) ** 2) -
        2 * GRAVITY * position.y * this.shootingVelocity ** 2) /
        (GRAVITY * position.z)
    );
  }

  turn(frame: cv.Mat) {
    const deltaXAngle = this.getAngleToBall(frame);
    const yAngle = this.getAngleToShoot(frame);

    this.launcher.rotateX(deltaXAngle, false);
    this.launcher.rotateY(yAngle, true);
  }

  shoot() {
    this.launcher.shoot();
  }

  detectBall(frame: cv.Mat) {
    return this.detectTarget(frame, new cv.Vec3(136, 150, 76), new cv.Vec3(179, 255, 255));
  }

  solveBallPosition(detectedData: DetectionData) {
    return this.solvePosition(LauncherCamera.OBJECT_DATA, detectedData);
  }
}
