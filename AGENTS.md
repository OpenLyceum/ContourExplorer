# AGENTS.md — Contour Explorer

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenLyceum/.github/AGENTS.md](https://github.com/OpenLyceum/.github/blob/main/AGENTS.md).

## Project

Contour Explorer (`contour-explorer`) teaches gradients, directional derivatives and level sets on seven surfaces: bowl, saddle, monkey saddle, a Gaussian hill, two hills, 2 sin x cos y, and a Rosenbrock-like valley. The surface is chosen from a combo box.

- **Explore:** a shaded contour map. Marching squares draw the contours at round levels covering the bulk of the values.
  - The level curve through the probe is highlighted, with its tangent (perpendicular to ∇f).
  - Drag the probe anywhere, or turn u by its tip. The sliders own the keyboard path.
  - "Reveal" draws ∇f at a fixed per-surface scale, so arrow length shows magnitude. It also draws the shadow of ∇f on u, which has length Dᵤf.
  - "Show critical points" marks maxima, minima, saddles and degenerate points, found by Newton's method on ∇f = 0 and classified with the Hessian.
- **Surface:** a depth-sorted 3D mesh of z = f(x, y) with the probe and the slice along u. Beside it, g(t) = f(p + t u) is drawn with its tangent at t = 0, whose slope is Dᵤf. Turn the view by dragging or with the view-angle slider.

## Key files

| File | Purpose |
|---|---|
| `src/common/model/ContourMath.ts` | Surface library (f, analytic ∇f, formula markup), directional derivative, Hessian test, `criticalPoints`, `contourLevels`, `sampleGrid`, `contourSegments` (marching squares) |
| `src/common/model/SurfaceData.ts` | Per-surface cache: grid, contour levels and segments, critical points, gradient arrow scale, 3D height range |
| `src/common/model/ContourModel.ts` | Probe, angle, surface, toggles and view angle; each screen has its own instance |
| `src/explore/view/ExploreScreenView.ts` | Contour map, colour map, probe and u grip |
| `src/surface/view/SurfaceScreenView.ts` | 3D mesh, slice, slice graph |
| `src/common/LabView.ts` | Shared with Circulation Lab: layout, sliders, checkbox, `comboBox`, `PlotCanvas`, `Plane`, canvas drawing helpers |
| `src/common/Projection.ts` | Orthographic projection, shared with Double Integral Builder and Circulation Lab |

## Compliance carve-outs

None yet.

## Testing

See the shared Vitest setup (`vitest.config.ts`, `tests/setup.ts`) and `tests/memory-leak.test.ts` for disposal coverage. Add sim-specific unit tests under `tests/` as physics and UI logic land.

## Accessibility

Follow [Baton/ACCESSIBILITY.md](https://github.com/OpenLyceum/Baton/blob/main/ACCESSIBILITY.md): PDOM names, per-screen `*ScreenSummaryContent`, and keyboard-help content. Document any intentional deviations under Compliance carve-outs.
