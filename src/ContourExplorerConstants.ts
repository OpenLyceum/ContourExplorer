/**
 * ContourExplorerConstants.ts
 *
 * Central repository for every named numeric constant used across the
 * simulation. Bare numbers that carry semantic meaning (sizes, margins,
 * physics defaults, ranges) belong here rather than inline in model or view
 * code, so they are named, documented, and changed in one place.
 *
 * Conventions
 * ───────────
 *  - Model / math values note their unit in a comment on each value.
 *  - Layout / chrome values are in screen pixels.
 *  - Colour strings live in ContourExplorerColors.ts, not here.
 *  - Computed expressions (e.g. `2 * Math.PI`) may stay inline.
 *
 * PLOT_* matches Circulation Lab and Double Integral Builder LabView copies
 * — keep those in sync.
 */

import ContourExplorerNamespace from "./ContourExplorerNamespace.js";

// ── Layout / chrome (screen pixels) ───────────────────────────────────────────

/** Margin between the screen edge and edge-anchored controls (e.g. Reset All). */
export const SCREEN_VIEW_MARGIN = 20;

/**
 * Corner radius shared by control panels and dialogs.
 * @public
 */
export const PANEL_CORNER_RADIUS = 6;

/** Lab plot canvas width (px). */
export const PLOT_WIDTH = 590;

/** Lab plot canvas height (px). */
export const PLOT_HEIGHT = 420;

/** Inner margin from plot edge to axis content (px). */
export const PLOT_MARGIN = 23;

/** Control panel minimum width (px). */
export const PANEL_MIN_WIDTH = 325;

/** Gap between plot and control panel (px). */
export const PANEL_GAP = 18;

/** Gap between title and plot/panel row (px). */
export const TITLE_TO_PLOT_GAP = 14;

/** Surface-screen 3D mesh resolution (cells along one side). */
export const SURFACE_MESH = 26;

/** Surface-screen orthographic pitch (degrees). */
export const SURFACE_PITCH = 32;

/** Surface-screen 3D view origin and scale (px). */
export const SURFACE_VIEW = { originX: 190, originY: 250, scale: 52 } as const;

/** Surface-screen slice graph box (px). */
export const SURFACE_SLICE = { left: 395, right: 575, top: 70, bottom: 330 } as const;

/** Half-length of the slice through the probe, in model units along u. */
export const SLICE_HALF = 2;

/** Drawn surface relief from lowest to highest level (model units). */
export const SURFACE_RELIEF = 2.2;

/** Degrees of yaw per pixel of horizontal drag on the 3D view. */
export const YAW_PER_PIXEL = 0.4;

// ── Model / math ──────────────────────────────────────────────────────────────

/** Half-width of the square window |x|, |y| ≤ EXTENT on both screens. */
export const EXTENT = 2.35;

/** Marching-squares / height sampling grid resolution. */
export const GRID = 100;

/** Number of contour levels across the bulk of surface values. */
export const CONTOUR_LEVEL_COUNT = 9;

ContourExplorerNamespace.register("ContourExplorerConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  PLOT_WIDTH,
  PLOT_HEIGHT,
  PLOT_MARGIN,
  PANEL_MIN_WIDTH,
  PANEL_GAP,
  TITLE_TO_PLOT_GAP,
  SURFACE_MESH,
  SURFACE_PITCH,
  SURFACE_VIEW,
  SURFACE_SLICE,
  SLICE_HALF,
  SURFACE_RELIEF,
  YAW_PER_PIXEL,
  EXTENT,
  GRID,
  CONTOUR_LEVEL_COUNT,
});
