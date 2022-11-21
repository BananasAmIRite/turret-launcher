import * as cv from '@u4/opencv4nodejs';
import * as fs from 'fs';
import { glob } from 'glob';

export default function calibrate(imgs: string[], patternSizeX: number, patternSizeY: number) {
  const objectPoints: cv.Point3[][] = [];
  const addObjPoint = () => {
    const a: cv.Point3[] = [];
    for (let y = 0; y < patternSizeY; y++) {
      for (let x = 0; x < patternSizeX; x++) {
        a.push(new cv.Point3(x, y, 0));
      }
    }
    objectPoints.push(a);
  };

  const imagePoints: cv.Point2[][] = [];

  console.log('Gathering images...');

  for (const img of imgs) {
    const image = cv.imread(img);

    const gray = image.cvtColor(cv.COLOR_BGR2GRAY);

    const { returnValue, corners } = gray.findChessboardCorners(new cv.Size(patternSizeX, patternSizeY));

    if (!returnValue) continue;
    addObjPoint();

    const corners2 = gray.cornerSubPix(
      corners,
      new cv.Size(11, 11),
      new cv.Size(-1, -1),
      new cv.TermCriteria(cv.termCriteria.EPS + cv.termCriteria.MAX_ITER, 30, 0.001)
    );

    imagePoints.push(corners2);
  }
  console.log('Calibrating...');

  const image = cv.imread(imgs[0]);

  const mtx = cv.Mat.eye(3, 3, cv.CV_64F);

  const { rvecs, tvecs, distCoeffs } = cv.calibrateCamera(
    // @ts-ignore
    objectPoints,
    // @ts-ignore
    imagePoints,
    new cv.Size(image.sizes[0], image.sizes[1]),
    mtx,
    []
  );

  const matrix = mtx.getOptimalNewCameraMatrix(
    distCoeffs,
    new cv.Size(image.sizes[0], image.sizes[1]),
    1
  );

  return {
    mtx: {
      fx: matrix.out.at(0, 0),
      fy: matrix.out.at(1, 1),
      cx: matrix.out.at(0, 2),
      cy: matrix.out.at(1, 2),
    },
    rvecs,
    tvecs,
    distCoeffs,
  };
}

const assets = glob.sync('./assets/*.jpg');
// const assets = ['./assets/calibrate_img2.jpg'];
fs.writeFileSync('./out/calibration.json', JSON.stringify(calibrate(assets, 9, 6)));
