import { describe, expect, it } from "vitest";
import {
  classify,
  contourLevels,
  contourSegments,
  criticalPoints,
  direction,
  directionalDerivative,
  gradient,
  height,
  sampleGrid,
  surfaces,
} from "../src/common/model/ContourMath.js";

describe("contour probes", () => {
  it("gives the saddle's uphill, downhill, and level directions", () => {
    const point = [1, 1] as const;
    expect(height("saddle", point)).toBe(0);
    expect(gradient("saddle", point)).toEqual([2, -2]);
    expect(directionalDerivative("saddle", point, 45)).toBeCloseTo(0, 12);
    expect(directionalDerivative("saddle", point, 315)).toBeCloseTo(Math.sqrt(8), 12);
    expect(directionalDerivative("saddle", point, 135)).toBeCloseTo(-Math.sqrt(8), 12);
  });

  it("has zero slope at the saddle center in every direction", () => {
    for (const angle of [0, 45, 90, 167, 270, 360]) {
      expect(directionalDerivative("saddle", [0, 0], angle)).toBeCloseTo(0, 12);
    }
    expect(height("saddle", [0.1, 0])).toBeGreaterThan(0);
    expect(height("saddle", [0, 0.1])).toBeLessThan(0);
  });

  it("uses unit directions and the bowl gradient", () => {
    expect(Math.hypot(...direction(17))).toBeCloseTo(1, 12);
    expect(gradient("bowl", [2, -1])).toEqual([4, -2]);
    expect(directionalDerivative("bowl", [2, -1], 90)).toBeCloseTo(-2, 12);
  });
});

describe("surface library", () => {
  it("pairs every surface with its gradient", () => {
    for (const surface of surfaces) {
      for (const point of [
        [0.3, -0.7],
        [-1.1, 0.4],
        [1.6, 1.2],
      ] as const) {
        const h = 1e-6;
        const [gx, gy] = gradient(surface, point);
        const dx = (height(surface, [point[0] + h, point[1]]) - height(surface, [point[0] - h, point[1]])) / (2 * h);
        const dy = (height(surface, [point[0], point[1] + h]) - height(surface, [point[0], point[1] - h])) / (2 * h);
        expect(gx).toBeCloseTo(dx, 5);
        expect(gy).toBeCloseTo(dy, 5);
      }
    }
  });

  it("finds and classifies critical points", () => {
    const kinds = (surface: (typeof surfaces)[number]) =>
      criticalPoints(surface, 2.35).map(({ point, kind }) => ({
        x: Math.round(point[0] * 100) / 100 + 0,
        y: Math.round(point[1] * 100) / 100 + 0,
        kind,
      }));
    expect(kinds("bowl")).toEqual([{ x: 0, y: 0, kind: "minimum" }]);
    expect(kinds("saddle")).toEqual([{ x: 0, y: 0, kind: "saddle" }]);
    expect(kinds("hill")).toEqual([{ x: 0, y: 0, kind: "maximum" }]);
    expect(kinds("monkey")).toEqual([{ x: 0, y: 0, kind: "degenerate" }]);
    expect(kinds("valley")).toEqual([{ x: 1, y: 1, kind: "minimum" }]);
    const hills = criticalPoints("twoHills", 2.35)
      .map(({ kind }) => kind)
      .sort((a, b) => a.localeCompare(b));
    expect(hills).toEqual(["maximum", "maximum", "saddle"]);
    // 2 sin x cos y: maxima and minima at (±π/2, 0), saddles at (0, ±π/2).
    expect(classify("waves", [Math.PI / 2, 0])).toBe("maximum");
    expect(classify("waves", [0, Math.PI / 2])).toBe("saddle");
  });

  it("traces level curves by marching squares", () => {
    const grid = sampleGrid("bowl", 2, 80);
    const segments = contourSegments(grid, 2, 1);
    expect(segments.length).toBeGreaterThan(40);
    for (const [a, b] of segments) {
      expect(Math.hypot(...a)).toBeCloseTo(1, 2);
      expect(Math.hypot(...b)).toBeCloseTo(1, 2);
    }
    expect(contourLevels(0, 9, 9)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});
