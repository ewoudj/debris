export function move(
  position: [number, number],
  direction: [number, number],
  speed: number,
  timeDelta: number
): void {
  if ((direction[1] !== 0 || direction[0] !== 0) && timeDelta > 0 && speed != 0) {
    const numberOfSeconds = 10 / timeDelta;
    const angle = (180 * Math.atan2(direction[0], direction[1])) / Math.PI;
    const delta = rotate([0, 0], [0, speed * numberOfSeconds], angle);
    position[0] += delta[0];
    position[1] += delta[1];
  }
}

export function rotate(c: [number, number], p: [number, number], angle: number): [number, number] {
  const radians = (Math.PI / 180) * angle;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return [
    cos * (p[0] - c[0]) + sin * (p[1] - c[1]) + c[0],
    cos * (p[1] - c[1]) - sin * (p[0] - c[0]) + c[1],
  ];
}

export function circleCircle(
  x0: number,
  y0: number,
  r0: number,
  x1: number,
  y1: number,
  r1: number
): boolean {
  const dx: number = x1 - x0;
  const dy: number = y1 - y0;
  const d: number = Math.sqrt(dy * dy + dx * dx);
  if (d > r0 + r1) {
    return false;
  } else {
    return true;
  }
}

const MAX_ITERATIONS: number = 10;
const innerPolygonCoef: Array<number> = new Array<number>();
const outerPolygonCoef: Array<number> = new Array<number>();

for (let t = 0; t <= MAX_ITERATIONS; t++) {
  const numNodes: number = 4 << t;
  innerPolygonCoef.push(0.5 / Math.cos((4 * Math.acos(0)) / numNodes));
  outerPolygonCoef.push(
    0.5 / (Math.cos((2 * Math.acos(0)) / numNodes) * Math.cos((2 * Math.acos(0)) / numNodes))
  );
}

function iterate(
  x: number,
  y: number,
  c0x: number,
  c0y: number,
  c2x: number,
  c2y: number,
  rr: number
) {
  for (let t = 1; t <= MAX_ITERATIONS; t++) {
    const c1x = (c0x + c2x) * innerPolygonCoef[t];
    const c1y = (c0y + c2y) * innerPolygonCoef[t];
    const tx = x - c1x;
    const ty = y - c1y;
    if (tx * tx + ty * ty <= rr) {
      return true;
    }
    const t2x = c2x - c1x;
    const t2y = c2y - c1y;
    if (
      tx * t2x + ty * t2y >= 0 &&
      tx * t2x + ty * t2y <= t2x * t2x + t2y * t2y &&
      (ty * t2x - tx * t2y >= 0 ||
        rr * (t2x * t2x + t2y * t2y) >= (ty * t2x - tx * t2y) * (ty * t2x - tx * t2y))
    ) {
      return true;
    }
    var t0x = c0x - c1x;
    var t0y = c0y - c1y;
    if (
      tx * t0x + ty * t0y >= 0 &&
      tx * t0x + ty * t0y <= t0x * t0x + t0y * t0y &&
      (ty * t0x - tx * t0y <= 0 ||
        rr * (t0x * t0x + t0y * t0y) >= (ty * t0x - tx * t0y) * (ty * t0x - tx * t0y))
    ) {
      return true;
    }
    const c3x = (c0x + c1x) * outerPolygonCoef[t];
    const c3y = (c0y + c1y) * outerPolygonCoef[t];
    if ((c3x - x) * (c3x - x) + (c3y - y) * (c3y - y) < rr) {
      c2x = c1x;
      c2y = c1y;
      continue;
    }
    const c4x = c1x - c3x + c1x;
    const c4y = c1y - c3y + c1y;
    if ((c4x - x) * (c4x - x) + (c4y - y) * (c4y - y) < rr) {
      c0x = c1x;
      c0y = c1y;
      continue;
    }
    const t3x = c3x - c1x;
    const t3y = c3y - c1y;
    if (
      ty * t3x - tx * t3y <= 0 ||
      rr * (t3x * t3x + t3y * t3y) > (ty * t3x - tx * t3y) * (ty * t3x - tx * t3y)
    ) {
      if (tx * t3x + ty * t3y > 0) {
        if (
          Math.abs(tx * t3x + ty * t3y) <= t3x * t3x + t3y * t3y ||
          (x - c3x) * (c0x - c3x) + (y - c3y) * (c0y - c3y) >= 0
        ) {
          c2x = c1x;
          c2y = c1y;
          continue;
        }
      } else if (
        -(tx * t3x + ty * t3y) <= t3x * t3x + t3y * t3y ||
        (x - c4x) * (c2x - c4x) + (y - c4y) * (c2y - c4y) >= 0
      ) {
        c0x = c1x;
        c0y = c1y;
        continue;
      }
    }
    return false;
  }
  return false; // Out of iterations so it is unsure if there was a collision. But have to return something.
}

// Test for collision between an ellipse of horizontal radius w0 and vertical radius h0 at (x0, y0) and
// an ellipse of horizontal radius w1 and vertical radius h1 at (x1, y1)
export function ellipseEllipse(
  x0: number,
  y0: number,
  w0: number,
  h0: number,
  x1: number,
  y1: number,
  w1: number,
  h1: number
) {
  const x = Math.abs(x1 - x0) * h1;
  const y = Math.abs(y1 - y0) * w1;
  w0 *= h1;
  h0 *= w1;
  const r = w1 * h1;

  if (
    x * x + (h0 - y) * (h0 - y) <= r * r ||
    (w0 - x) * (w0 - x) + y * y <= r * r ||
    x * h0 + y * w0 <= w0 * h0 ||
    ((x * h0 + y * w0 - w0 * h0) * (x * h0 + y * w0 - w0 * h0) <= r * r * (w0 * w0 + h0 * h0) &&
      x * w0 - y * h0 >= -h0 * h0 &&
      x * w0 - y * h0 <= w0 * w0)
  ) {
    return true;
  } else {
    if (
      (x - w0) * (x - w0) + (y - h0) * (y - h0) <= r * r ||
      (x <= w0 && y - r <= h0) ||
      (y <= h0 && x - r <= w0)
    ) {
      return iterate(x, y, w0, 0, 0, h0, r * r);
    }
    return false;
  }
}

// Test for collision between an ellipse of horizontal radius w and vertical radius h at (x0, y0) and
// a circle of radius r at (x1, y1)
export function ellipseCircle(
  x0: number,
  y0: number,
  w: number,
  h: number,
  x1: number,
  y1: number,
  r: number
) {
  const x = Math.abs(x1 - x0);
  const y = Math.abs(y1 - y0);

  if (
    x * x + (h - y) * (h - y) <= r * r ||
    (w - x) * (w - x) + y * y <= r * r ||
    x * h + y * w <= w * h ||
    ((x * h + y * w - w * h) * (x * h + y * w - w * h) <= r * r * (w * w + h * h) &&
      x * w - y * h >= -h * h &&
      x * w - y * h <= w * w)
  ) {
    return true;
  } else {
    if (
      (x - w) * (x - w) + (y - h) * (y - h) <= r * r ||
      (x <= w && y - r <= h) ||
      (y <= h && x - r <= w)
    ) {
      return iterate(x, y, w, 0, 0, h, r * r);
    }
    return false;
  }
}

export interface LineIntersectionResult {
  x: null | number;
  y: null | number;
  onLine1: boolean;
  onLine2: boolean;
}

export function lineIntersection(
  line1StartX: number,
  line1StartY: number,
  line1EndX: number,
  line1EndY: number,
  line2StartX: number,
  line2StartY: number,
  line2EndX: number,
  line2EndY: number
): LineIntersectionResult {
  // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
  const result: LineIntersectionResult = {
    x: null,
    y: null,
    onLine1: false,
    onLine2: false,
  };
  const denominator =
    (line2EndY - line2StartY) * (line1EndX - line1StartX) -
    (line2EndX - line2StartX) * (line1EndY - line1StartY);
  if (denominator !== 0) {
    let a = line1StartY - line2StartY;
    let b = line1StartX - line2StartX;
    const numerator1 = (line2EndX - line2StartX) * a - (line2EndY - line2StartY) * b;
    const numerator2 = (line1EndX - line1StartX) * a - (line1EndY - line1StartY) * b;
    a = numerator1 / denominator;
    b = numerator2 / denominator;
    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = line1StartX + a * (line1EndX - line1StartX);
    result.y = line1StartY + a * (line1EndY - line1StartY);
    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > 0 && a < 1) {
      result.onLine1 = true;
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > 0 && b < 1) {
      result.onLine2 = true;
    }
    // if line1 and line2 are segments, they intersect if both of the above are true
  }
  return result;
}
