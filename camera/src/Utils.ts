import { eigs, MathNumericType } from 'mathjs';

// relic
// export function solveQuartic(a: number, b: number, c: number, d: number, e: number) {
//   let p = 2 * c ** 3 - 9 * b * c * d + 27 * a * d ** 2 + 27 * b ** 2 * e - 72 * a * c * e;
//   let q = c ** 2 - 3 * b * d + 12 * a * e;

//   let r = divide(multiply(q, nthRoot(2, 3)), multiply(3 * a, pow(add(p, sqrt(-4 * q ** 3 + p ** 2)), 1 / 3)));
//   let s = divide(pow(add(p, sqrt(-4 * q ** 3 + p ** 2)), 1 / 3), multiply(3 * a, nthRoot(2, 3)));
//   let t = sqrt(add(add(b ** 2 / (4 * a ** 2) - (2 * c) / (3 * a), r), s) as Complex);

//   console.log(sqrt(-4 * q ** 3 + p ** 2));

//   console.log(p);
//   console.log(q);

//   // console.log(q * Math.pow(2, 1 / 3));

//   console.log(r);
//   console.log(s);
//   console.log(t);

//   let s1 = subtract(-b / (4 * a), multiply(1 / 2, t));
//   console.log(s1);

//   let s2 = subtract(subtract(b ** 2 / (2 * a ** 2) - (4 * c) / (3 * a), r), s);
//   console.log(s2);

//   let s3 = divide(-1 * (b ** 3 / a ** 3) + (4 * b * c) / a ** 2 - (8 * d) / a, multiply(4, t));
//   console.log(s3);

//   return [
//     subtract(s1, multiply(1 / 2, sqrt(subtract(s2, s3) as Complex))),
//     add(s1, multiply(1 / 2, sqrt(subtract(s2, s3) as Complex))),
//     subtract(s1, multiply(1 / 2, sqrt(add(s2, s3) as Complex))),
//     add(s1, multiply(1 / 2, sqrt(add(s2, s3) as Complex))),
//   ];
// }
// // console.log(nthRoot(sqrt(-4) as math.Complex, 1 / 3));

// console.log(solveQuartic(1, -18, 119, -342, 360));

export function solveQuarticEig(a: number, b: number, c: number, d: number, e: number): number[] {
  const mat = [
    [0, 0, 0, -e / a],
    [1, 0, 0, -d / a],
    [0, 1, 0, -c / a],
    [0, 0, 1, -b / a],
  ];

  try {
    return (eigs(mat)?.values as MathNumericType[]).filter((e) => typeof e === 'number') as number[];
  } catch (err) {
    return [];
  }
}

export function normalizeAngle(angle: number) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}
