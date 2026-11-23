import { describe, expect, it } from "vitest";
import { direction, directionalDerivative, gradient, height } from "../src/common/model/ContourMath.js";

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
