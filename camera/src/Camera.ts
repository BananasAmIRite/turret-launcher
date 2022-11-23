import * as cv from '@u4/opencv4nodejs';

export interface DetectionData {
  width: number;
  height: number;
  pixelX: number;
  pixelY: number;
}

export interface PnPObjectData {
  width: number;
  height: number;
}

export interface CameraData {
  fx: number;
  cx: number;
  fy: number;
  cy: number;
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export default class Camera {
  public constructor(
    protected capture: cv.VideoCapture,
    protected cameraData: CameraData,
    protected distCoeffs: number[]
  ) {}

  detectTarget(frame: cv.Mat, rangeLow: cv.Vec3, rangeHigh: cv.Vec3) {
    const recolored = frame.cvtColor(cv.COLOR_BGR2HSV);
    const filtered = recolored.inRange(rangeLow, rangeHigh);
    const contours = filtered.findContours(cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

    if (contours.length === 0) return null;
    const data = contours.reduce((a, b) => (a.area > b.area ? a : b)).boundingRect();

    return {
      pixelX: data.x + data.width / 2,
      pixelY: data.y + data.height / 2,
      width: data.width,
      height: data.height,

      frame,
    };
  }

  solvePosition(objectData: PnPObjectData, detectionData: DetectionData): Position {
    const objectPoints = [
      new cv.Point3(-objectData.width / 2, -objectData.height / 2, 0),
      new cv.Point3(objectData.width / 2, -objectData.height / 2, 0),
      new cv.Point3(-objectData.width / 2, objectData.height / 2, 0),
      new cv.Point3(objectData.width / 2, objectData.height / 2, 0),
    ];

    const imagePoints = [
      new cv.Point2(detectionData.pixelX - detectionData.width / 2, detectionData.pixelY - detectionData.height / 2),
      new cv.Point2(detectionData.pixelX + detectionData.width / 2, detectionData.pixelY - detectionData.height / 2),
      new cv.Point2(detectionData.pixelX - detectionData.width / 2, detectionData.pixelY + detectionData.height / 2),
      new cv.Point2(detectionData.pixelX + detectionData.width / 2, detectionData.pixelY + detectionData.height / 2),
    ];

    const camMatrix = new cv.Mat(3, 3, cv.CV_64F, 0);
    camMatrix.set(0, 0, this.cameraData.fx);
    camMatrix.set(0, 2, this.cameraData.cx);
    camMatrix.set(1, 1, this.cameraData.fy);
    camMatrix.set(1, 2, this.cameraData.cy);
    camMatrix.set(2, 2, 1);

    const solved = cv.solvePnP(objectPoints, imagePoints, camMatrix, this.distCoeffs);
    return {
      x: -solved.tvec.x,
      y: -solved.tvec.y,
      z: solved.tvec.z,
    };
  }
}
