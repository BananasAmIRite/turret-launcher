import * as cv from '@u4/opencv4nodejs';
import Camera, { CameraData, DetectionData, PnPObjectData } from './Camera';
import Launcher from './Launcher';
import { solveQuarticEig, normalizeAngle } from './Utils';

const GRAVITY = 9.81;

export default class LauncherCamera extends Camera {
  // TODO: modify these; units is meters
  private static OBJECT_DATA: PnPObjectData = { width: 0.055, height: 0.15 };

  public constructor(
    capture: cv.VideoCapture,
    cameraData: CameraData,
    distCoeffs: number[],
    private launcher: Launcher,
    // muzzle velocity of the projectile
    private shootingVelocity: number = 1,
    // height of the launcher relative to the camera in meters; positive means launcher is above, negative means launcher is below
    private relativeHeight: number = 0,
    // distance from the center of rotation of the launcher to the muzzle in meters
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

    const angles = this.getShootingAngle(
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

    return `Turning to angle: x: ${(xAngle * 180) / Math.PI}, y: ${(yAngle * 180) / Math.PI}`;
  }

  shoot() {
    this.launcher.shoot();
    return `Shooting...`;
  }

  detectBall(frame: cv.Mat) {
    return this.detectTarget(frame, new cv.Vec3(136, 150, 76), new cv.Vec3(179, 255, 255)); // TODO: change to match target
  }

  solveBallPosition(detectedData: DetectionData) {
    return this.solvePosition(LauncherCamera.OBJECT_DATA, detectedData);
  }

  private getShootingAngle(
    y0: number,
    v0: number,
    dist: number,
    xf: number,
    yf: number,
    g = 10,
    EPSILION = 0.02 * yf + 5
  ) {
    // derived coefficients
    const a = (dist ** 2 * g + 2 * v0 ** 2 * yf - 2 * y0 * v0 ** 2) ** 2 + 4 * v0 ** 4 * xf ** 2;
    const b = -4 * xf * g * dist * (dist ** 2 * g + 2 * v0 ** 2 * yf - 2 * v0 ** 2 * y0);
    const c =
      2 * xf ** 2 * g * (dist ** 2 * g + 2 * v0 ** 2 * yf - 2 * v0 ** 2 * y0) +
      4 * (xf * g * dist) ** 2 -
      4 * xf ** 2 * v0 ** 4;
    const d = -4 * xf ** 3 * g ** 2 * dist;
    const e = xf ** 4 * g ** 2;

    const solved = solveQuarticEig(a, b, c, d, e);

    return solved
      .map((e) => Math.acos(e)) // get the arccos of each solution
      .concat(solved.map((e) => normalizeAngle(-Math.acos(e)))) // add the extra solutions not from acos
      .filter(
        (e) =>
          e <= Math.PI / 2 &&
          e >= -Math.PI / 2 && // make sure each value is within bounds [-pi/2, pi/2]; it doesn't make sense to get [-pi, pi] cuz camera
          Math.abs(
            (dist ** 2 * g + 2 * v0 ** 2 * yf - 2 * v0 ** 2 * y0) * Math.cos(e) ** 2 -
              2 * xf * g * dist * Math.cos(e) -
              xf * v0 ** 2 * Math.sin(2 * e) +
              xf ** 2 * g
          ) <= EPSILION // make sure values are a good estimation; get rid of extraneous solutions
      );
  }
}
