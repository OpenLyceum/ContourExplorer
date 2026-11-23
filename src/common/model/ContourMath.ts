export type Surface = "bowl" | "saddle";
export type Point = readonly [number, number];

export function height(surface: Surface, [x, y]: Point): number {
  return x * x + (surface === "bowl" ? 1 : -1) * y * y;
}

export function gradient(surface: Surface, [x, y]: Point): Point {
  return [2 * x, (surface === "bowl" ? 2 : -2) * y];
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
