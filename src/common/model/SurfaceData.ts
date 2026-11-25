import {
  type CriticalPoint,
  contourLevels,
  contourSegments,
  criticalPoints,
  gradient,
  type Point,
  type Surface,
  sampleGrid,
} from "./ContourMath.js";
import { EXTENT } from "./ContourModel.js";

const GRID = 100;

/** Everything about a surface that does not depend on the probe, computed once. */
export type SurfaceData = {
  grid: number[][];
  low: number;
  high: number;
  /** The range drawn in 3D: everything but the steepest few percent of the rim. */
  floor: number;
  ceiling: number;
  levels: number[];
  contours: [Point, Point][][];
  critical: CriticalPoint[];
  /** Model units of arrow per unit of |∇f|, fixed per surface so arrow length shows magnitude. */
  gradientScale: number;
};

const cache = new Map<Surface, SurfaceData>();

export function surfaceData(surface: Surface): SurfaceData {
  const cached = cache.get(surface);
  if (cached) {
    return cached;
  }
  const grid = sampleGrid(surface, EXTENT, GRID);
  const values = grid.flat().sort((a, b) => a - b);
  const quantile = (q: number) => values[Math.floor(q * (values.length - 1))] ?? 0;
  // Levels cover the bulk of the values, so a steep rim does not starve the interesting middle.
  const levels = contourLevels(quantile(0.01), quantile(0.9), 9);
  const slopes = grid
    .flatMap((row, j) =>
      row.map((_, i) => {
        const [a, b] = gradient(surface, [-EXTENT + (2 * EXTENT * i) / GRID, -EXTENT + (2 * EXTENT * j) / GRID]);
        return Math.hypot(a, b);
      }),
    )
    .sort((a, b) => a - b);
  const typical = slopes[Math.floor(0.75 * (slopes.length - 1))] ?? 1;
  const data = {
    grid,
    low: quantile(0.01),
    high: quantile(0.9),
    floor: quantile(0),
    ceiling: quantile(0.97),
    levels,
    contours: levels.map((level) => contourSegments(grid, EXTENT, level)),
    critical: criticalPoints(surface, EXTENT),
    gradientScale: 0.9 / Math.max(typical, 1e-6),
  };
  cache.set(surface, data);
  return data;
}
