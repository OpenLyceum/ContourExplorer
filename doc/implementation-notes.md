# Implementation notes — Contour Explorer

The screen packages are explore. Each model owns its reactive controls and resets them through the standard Reset All button. The pure calculations live in `src/common/model/ContourMath.ts` and are exercised by model tests.

The contour view draws analytic level curves in a Scenery canvas. Pointer dragging and the coordinate sliders set the same probe position. The direction slider remains separate from the gradient reveal.

The shared Scenery view arranges the plot and controls, registers the live accessible screen summary, and reads the active color profile. Screen-specific text comes from `StringManager`.
