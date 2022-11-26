import * as cv from '@u4/opencv4nodejs';
import Camera, { CameraData, DetectionData, PnPObjectData } from './Camera';
import Launcher from './Launcher';
import { getShootingAngle } from './Utils';

const GRAVITY = 9.81;

export default class LauncherCamera extends Camera {
  private static OBJECT_DATA: PnPObjectData = { width: 0.055, height: 0.15 };

  public constructor(
    capture: cv.VideoCapture,
    cameraData: CameraData,
    distCoeffs: number[],
    private launcher: Launcher,
    // muzzle velocity of the projectile
    private shootingVelocity: number,
    // height of the launcher relative to the camera in meters; positive means launcher is above, negative means launcher is below
    private relativeHeight: number = 0,
    // relative distance from the center of rotation of the launcher to the muzzle
    private launcherDistFromCenter: number = 0
  ) {
    super(capture, cameraData, distCoeffs);
  }

  getAngleToBall(frame: cv.Mat) {
    const detectedData = this.detectBall(frame);
    if (!detectedData) throw new Error('No target detected');
    const position = this.solveBallPosition(detectedData);
    if (!position) throw new Error('No target detected');

    return Math.atan(-position.x / position.z); // TODO: may need to add or not add a negative sign to this
  }

  getAngleToShoot(frame: cv.Mat, angleToBall = 0) {
    const detectedData = this.detectBall(frame);
    if (!detectedData) throw new Error('No target detected');
    const position = this.solveBallPosition(detectedData);
    if (!position) throw new Error('No target detected');

    const z2 = position.z * Math.cos(angleToBall) - position.x * Math.sin(angleToBall);
    // const x2 = position.x * Math.cos(angleToBall) + position.z * Math.sin(angleToBall);

    // return Math.atan(
    //   (this.shootingVelocity ** 2 -
    //     Math.sqrt(this.shootingVelocity ** 4 - (GRAVITY * position.z) ** 2) -
    //     2 * GRAVITY * position.y * this.shootingVelocity ** 2 +
    //     2 * GRAVITY * this.relativeHeight * this.shootingVelocity ** 2) /
    //     (GRAVITY * position.z)
    // );

    const angles = getShootingAngle(
      this.relativeHeight,
      this.shootingVelocity,
      this.launcherDistFromCenter,
      z2,
      position.y,
      GRAVITY
    );

    if (angles.length === 0) throw new Error('No suitable shooting angle detected');

    return angles.reduce((a, b) => (Math.abs(b) < Math.abs(a) ? b : a), 2 * Math.PI); // find the one closest to the ground so it doesnt shoot into the ceiling
  }

  turn(frame: cv.Mat) {
    const xAngle = this.getAngleToBall(frame);
    const yAngle = this.getAngleToShoot(frame, xAngle);

    this.launcher.rotateX(xAngle, true);
    this.launcher.rotateY(yAngle, true);

    return `Turning to angle: ${(xAngle * 180) / Math.PI}, ${(yAngle * 180) / Math.PI}`;
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
