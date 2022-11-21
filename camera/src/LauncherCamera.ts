import * as cv from '@u4/opencv4nodejs';
import Camera, { CameraData, DetectionData, PnPObjectData } from './Camera';

const GRAVITY = 9.81;

export default class LauncherCamera extends Camera {
  private static OBJECT_DATA: PnPObjectData = { width: 0.055, height: 0.1 };

  public constructor(
    capture: cv.VideoCapture,
    cameraData: CameraData,
    distCoeffs: number[],
    private shootingVelocity: number
  ) {
    super(capture, cameraData, distCoeffs);
  }

  getAngleToBall() {
    const detectedData = this.detectBall();
    if (!detectedData) throw new Error('No target detected');
    const position = this.solveBallPosition(detectedData);
    if (!position) throw new Error('No target detected');

    return Math.atan(position.x / position.z);
  }

  getAngleToShoot() {
    const detectedData = this.detectBall();
    if (!detectedData) throw new Error('No target detected');
    const position = this.solveBallPosition(detectedData);
    if (!position) throw new Error('No target detected');

    if (Math.abs(position.x) > 0.5) throw new Error('Target not close enough');

    return Math.atan(
      (this.shootingVelocity ** 2 -
        Math.sqrt(this.shootingVelocity ** 4 - (GRAVITY * position.z) ** 2) -
        2 * GRAVITY * position.y * this.shootingVelocity ** 2) /
        (GRAVITY * position.z)
    );
  }

  turn() {
    throw new Error('abc');
  }

  shoot() {}

  detectBall() {
    return this.detectTarget(new cv.Vec3(136, 150, 76), new cv.Vec3(179, 255, 255));
  }

  solveBallPosition(detectedData: DetectionData) {
    return this.solvePosition(LauncherCamera.OBJECT_DATA, detectedData);
  }
}
