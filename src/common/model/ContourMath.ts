export const surfaces = ["bowl", "saddle", "monkey", "hill", "twoHills", "waves", "valley"] as const;
export type Surface = (typeof surfaces)[number];
export type Point = readonly [number, number];
/** @internal Exported for unit tests; not part of the application API. */
export type CriticalKind = "minimum" | "maximum" | "saddle" | "degenerate";
export type CriticalPoint = { readonly point: Point; readonly kind: CriticalKind };

/** A surface z = f(x, y) with its analytic gradient and its formula (RichText markup). */
type Entry = {
  readonly label: string;
  readonly f: (x: number, y: number) => number;
  readonly gradient: (x: number, y: number) => Point;
};

const bump = (x: number, y: number, cx: number, cy: number, peak: number) =>
  peak * Math.exp(-((x - cx) ** 2 + (y - cy) ** 2));

const library: Readonly<Record<Surface, Entry>> = {
  bowl: { label: "x<sup>2</sup> + y<sup>2</sup>", f: (x, y) => x * x + y * y, gradient: (x, y) => [2 * x, 2 * y] },
  saddle: { label: "x<sup>2</sup> − y<sup>2</sup>", f: (x, y) => x * x - y * y, gradient: (x, y) => [2 * x, -2 * y] },
  monkey: {
    label: "x<sup>3</sup> − 3xy<sup>2</sup>",
    f: (x, y) => x ** 3 - 3 * x * y * y,
    gradient: (x, y) => [3 * x * x - 3 * y * y, -6 * x * y],
  },
  hill: {
    label: "3e<sup>−(x² + y²)</sup>",
    f: (x, y) => bump(x, y, 0, 0, 3),
    gradient: (x, y) => [-2 * x * bump(x, y, 0, 0, 3), -2 * y * bump(x, y, 0, 0, 3)],
  },
  twoHills: {
    label: "2e<sup>−((x−1)² + y²)</sup> + 1.5e<sup>−((x+1)² + (y−0.6)²)</sup>",
    f: (x, y) => bump(x, y, 1, 0, 2) + bump(x, y, -1, 0.6, 1.5),
    gradient: (x, y) => {
      const a = bump(x, y, 1, 0, 2);
      const b = bump(x, y, -1, 0.6, 1.5);
      return [-2 * (x - 1) * a - 2 * (x + 1) * b, -2 * y * a - 2 * (y - 0.6) * b];
    },
  },
  waves: {
    label: "2 sin x cos y",
    f: (x, y) => 2 * Math.sin(x) * Math.cos(y),
    gradient: (x, y) => [2 * Math.cos(x) * Math.cos(y), -2 * Math.sin(x) * Math.sin(y)],
  },
  valley: {
    label: "0.2((1 − x)<sup>2</sup> + 5(y − x<sup>2</sup>)<sup>2</sup>)",
    f: (x, y) => 0.2 * ((1 - x) ** 2 + 5 * (y - x * x) ** 2),
    gradient: (x, y) => [0.2 * (-2 * (1 - x) - 20 * x * (y - x * x)), 0.2 * 10 * (y - x * x)],
  },
};

/** The formula of a surface, as RichText markup for "f(x, y) = …". */
export function formula(surface: Surface): string {
  return library[surface].label;
}

export function height(surface: Surface, [x, y]: Point): number {
  return library[surface].f(x, y);
}

export function gradient(surface: Surface, [x, y]: Point): Point {
  return library[surface].gradient(x, y);
}

export function direction(degrees: number): Point {
  const radians = (degrees * Math.PI) / 180;
  return [Math.cos(radians), Math.sin(radians)];
}

export function directionalDerivative(surface: Surface, point: Point, degrees: number): number {
  const [a, b] = gradient(surface, point);
  const [u, v] = direction(degrees);
  return a * u + b * v;
}

/** The Hessian [[fxx, fxy], [fxy, fyy]] by central differences of the analytic gradient. */
function hessian(surface: Surface, [x, y]: Point): [number, number, number] {
  const h = 1e-5;
  const [gxRight, gyRight] = gradient(surface, [x + h, y]);
  const [gxLeft, gyLeft] = gradient(surface, [x - h, y]);
  const [gxUp] = gradient(surface, [x, y + h]);
  const [gxDown] = gradient(surface, [x, y - h]);
  const [, gyUp] = gradient(surface, [x, y + h]);
  const [, gyDown] = gradient(surface, [x, y - h]);
  const fxx = (gxRight - gxLeft) / (2 * h);
  const fyy = (gyUp - gyDown) / (2 * h);
  const fxy = ((gyRight - gyLeft) / (2 * h) + (gxUp - gxDown) / (2 * h)) / 2;
  return [fxx, fxy, fyy];
}

/** The second-derivative test: the sign of det H and of fxx.
 *
 * @internal Exported for unit tests; not part of the application API.
 */
export function classify(surface: Surface, point: Point): CriticalKind {
  const [fxx, fxy, fyy] = hessian(surface, point);
  const det = fxx * fyy - fxy * fxy;
  if (Math.abs(det) < 1e-6) {
    return "degenerate";
  }
  return det < 0 ? "saddle" : fxx > 0 ? "minimum" : "maximum";
}

/**
 * Critical points inside the square |x|, |y| ≤ extent: Newton's method on ∇f = 0 from a grid of
 * seeds, kept when it converges inside the square, then merged and classified.
 */
export function criticalPoints(surface: Surface, extent: number): CriticalPoint[] {
  const found: Point[] = [];
  const seeds = 13;
  for (let i = 0; i < seeds; i++) {
    for (let j = 0; j < seeds; j++) {
      let x = -extent + (2 * extent * i) / (seeds - 1);
      let y = -extent + (2 * extent * j) / (seeds - 1);
      for (let k = 0; k < 40; k++) {
        const [gx, gy] = gradient(surface, [x, y]);
        const [a, b, c] = hessian(surface, [x, y]);
        const det = a * c - b * b;
        if (Math.abs(det) < 1e-12) {
          break;
        }
        x -= (c * gx - b * gy) / det;
        y -= (a * gy - b * gx) / det;
        if (!(Math.abs(x) <= extent * 1.5 && Math.abs(y) <= extent * 1.5)) {
          break;
        }
      }
      const [gx, gy] = gradient(surface, [x, y]);
      const inside = Math.abs(x) <= extent && Math.abs(y) <= extent;
      if (inside && Math.hypot(gx, gy) < 1e-8 && !found.some(([p, q]) => Math.hypot(p - x, q - y) < 1e-4)) {
        found.push([x, y]);
      }
    }
  }
  // Newton stalls at a degenerate point like the monkey saddle's centre; test the origin directly.
  const [ox, oy] = gradient(surface, [0, 0]);
  if (Math.hypot(ox, oy) < 1e-12 && !found.some(([p, q]) => Math.hypot(p, q) < 1e-4)) {
    found.push([0, 0]);
  }
  return found.map((point) => ({ point, kind: classify(surface, point) }));
}

/** About `count` evenly spaced round values (steps of 1, 2 or 5 × 10ⁿ) inside (min, max). */
export function contourLevels(min: number, max: number, count = 8): number[] {
  const span = max - min;
  if (!(span > 0)) {
    return [];
  }
  const raw = span / count;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = ([1, 2, 5, 10].find((factor) => factor * power >= raw) ?? 10) * power;
  const levels: number[] = [];
  for (let value = Math.ceil(min / step) * step; value < max; value += step) {
    if (value > min) {
      levels.push(Math.abs(value) < step * 1e-9 ? 0 : Number(value.toPrecision(12)));
    }
  }
  return levels;
}

/** Values of f on an (n + 1) × (n + 1) grid over the square |x|, |y| ≤ extent, row by row in y. */
export function sampleGrid(surface: Surface, extent: number, n: number): number[][] {
  const { f } = library[surface];
  return Array.from({ length: n + 1 }, (_, j) => {
    const row = -extent + (2 * extent * j) / n;
    return Array.from({ length: n + 1 }, (_cell, i) => f(-extent + (2 * extent * i) / n, row));
  });
}

/**
 * Marching squares: the segments of the level set f = level on the sampled grid, with each
 * crossing placed by linear interpolation along the cell edge.
 */
export function contourSegments(grid: number[][], extent: number, level: number): [Point, Point][] {
  const n = grid.length - 1;
  const step = (2 * extent) / n;
  const segments: [Point, Point][] = [];
  const at = (i: number, j: number) => grid[j]?.[i] ?? 0;
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const x0 = -extent + i * step;
      const y0 = -extent + j * step;
      const corners: [number, Point][] = [
        [at(i, j), [x0, y0]],
        [at(i + 1, j), [x0 + step, y0]],
        [at(i + 1, j + 1), [x0 + step, y0 + step]],
        [at(i, j + 1), [x0, y0 + step]],
      ];
      const crossings: Point[] = [];
      for (let k = 0; k < 4; k++) {
        const [va, pa] = corners[k] ?? [0, [0, 0]];
        const [vb, pb] = corners[(k + 1) % 4] ?? [0, [0, 0]];
        if (va < level !== vb < level) {
          const t = (level - va) / (vb - va);
          crossings.push([pa[0] + t * (pb[0] - pa[0]), pa[1] + t * (pb[1] - pa[1])]);
        }
      }
      const [a, b, c, d] = crossings;
      if (a && b) {
        segments.push([a, b]);
      }
      if (c && d) {
        segments.push([c, d]);
      }
    }
  }
  return segments;
}
