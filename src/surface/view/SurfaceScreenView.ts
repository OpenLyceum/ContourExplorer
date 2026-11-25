import { DragListener, Node, Rectangle } from "scenerystack/scenery";
import type { ScreenViewOptions } from "scenerystack/sim";
import Colors from "../../ContourExplorerColors.js";
import {
  SURFACE_MESH as MESH,
  SURFACE_PITCH as PITCH,
  SURFACE_RELIEF as RELIEF,
  SURFACE_SLICE as SLICE,
  SLICE_HALF,
  SURFACE_VIEW as VIEW,
  YAW_PER_PIXEL,
} from "../../ContourExplorerConstants.js";
import {
  arrow,
  comboBox,
  computed,
  dot,
  format,
  LabView,
  line,
  PlotCanvas,
  plotLabel,
  slider,
} from "../../common/LabView.js";
import {
  direction,
  directionalDerivative,
  formula,
  height,
  type Point,
  surfaces,
} from "../../common/model/ContourMath.js";
import { type ContourModel, EXTENT } from "../../common/model/ContourModel.js";
import { surfaceData } from "../../common/model/SurfaceData.js";
import { orthographic } from "../../common/Projection.js";
import { StringManager } from "../../i18n/StringManager.js";

type Point3 = readonly [number, number, number];

export class SurfaceScreenView extends LabView {
  public constructor(model: ContourModel, options?: ScreenViewOptions) {
    const manager = StringManager.getInstance();
    const { controls: s } = manager.getExploreA11yStrings();
    const { screenSummary, controls: t } = manager.getSurfaceA11yStrings();
    const { surfaceProperty, xProperty, yProperty, angleProperty, yawProperty, properties } = model;
    const point = (): Point => [xProperty.value, yProperty.value];
    const plain = (markup: string) => markup.replace(/<sup>([^<]*)<\/sup>/g, "^($1)").replace(/<[^>]+>/g, "");
    const formulaLine = computed([surfaceProperty], () => `f(x, y) = ${formula(surfaceProperty.value)}`);
    const coordinates = computed(
      properties,
      () =>
        `(x, y) = (${format(xProperty.value)}, ${format(yProperty.value)})    f = ${format(height(surfaceProperty.value, point()))}`,
    );
    const slope = computed(
      properties,
      () => `D<sub>u</sub>f = ${format(directionalDerivative(surfaceProperty.value, point(), angleProperty.value))}`,
    );
    const details = computed(
      [formulaLine, coordinates, slope, angleProperty],
      () =>
        `${plain(formulaLine.value)}. ${coordinates.value}. ${s.angleStringProperty.value} ${format(angleProperty.value)}°. ${plain(slope.value)}. ${t.sliceStringProperty.value}.`,
    );

    const plot = new PlotCanvas(properties, (context, colors) => {
      const surface = surfaceProperty.value;
      const data = surfaceData(surface);
      const middle = (data.floor + data.ceiling) / 2;
      const zScale = RELIEF / Math.max(1e-9, data.ceiling - data.floor);
      // Heights beyond the contour range are clipped so a steep rim does not swamp the view.
      const z = (value: number) => (Math.max(data.floor, Math.min(data.ceiling, value)) - middle) * zScale;
      const project = orthographic(yawProperty.value, PITCH, VIEW.scale, [VIEW.originX, VIEW.originY]);
      const at = ([px, py]: Point, value: number) => project([px, py, z(value)] as Point3);
      const step = (2 * EXTENT) / MESH;
      const quads: { depth: number; corners: Point[]; value: number }[] = [];
      for (let j = 0; j < MESH; j++) {
        for (let i = 0; i < MESH; i++) {
          const x0 = -EXTENT + i * step;
          const y0 = -EXTENT + j * step;
          const cell: Point[] = [
            [x0, y0],
            [x0 + step, y0],
            [x0 + step, y0 + step],
            [x0, y0 + step],
          ];
          const projected = cell.map((p) => at(p, height(surface, p)));
          quads.push({
            depth: projected.reduce((sum, p) => sum + p.depth, 0) / 4,
            corners: projected.map((p) => p.point),
            value: height(surface, [x0 + step / 2, y0 + step / 2]),
          });
        }
      }
      // Painter's algorithm: far quads first.
      quads.sort((a, b) => a.depth - b.depth);
      const above = Colors.accentColorProperty.value;
      const below = Colors.secondaryPlotColorProperty.value;
      for (const quad of quads) {
        const weight = Math.min(1, Math.abs(quad.value - middle) / Math.max(1e-9, (data.ceiling - data.floor) / 2));
        const fill = (quad.value >= middle ? above : below).withAlpha(0.25 + 0.55 * weight).toCSS();
        line(context, quad.corners, colors.grid, 0.6, fill);
      }
      // The slice of the surface along u through the probe, and the tangent line of slope Dᵤf.
      const [x, y] = point();
      const [u, v] = direction(angleProperty.value);
      const along = (tValue: number): Point => [x + tValue * u, y + tValue * v];
      const inside = ([px, py]: Point) => Math.abs(px) <= EXTENT && Math.abs(py) <= EXTENT;
      const samples = Array.from({ length: 121 }, (_, i) => -SLICE_HALF + (2 * SLICE_HALF * i) / 120);
      const slice = samples.map(along).filter(inside);
      line(
        context,
        slice.map((p) => at(p, height(surface, p)).point),
        colors.ink,
        3,
      );
      const f0 = height(surface, [x, y]);
      const d = directionalDerivative(surface, [x, y], angleProperty.value);
      const reach = 0.7;
      arrow(
        context,
        at(along(-reach), f0 - reach * d).point,
        at(along(reach), f0 + reach * d).point,
        colors.alternate,
        2.5,
      );
      dot(context, at([x, y], f0).point, colors.accent, 6);
      plotLabel(context, `${t.viewStringProperty.value}`, [14, 22], colors.ink);

      // The slice as a graph of g(t) = f(p + t u): its slope at t = 0 is Dᵤf.
      const g = samples.map((tValue) => [tValue, height(surface, along(tValue))] as const);
      const values = g.map(([, value]) => value);
      const low = Math.min(...values, f0 - 0.5);
      const high = Math.max(...values, f0 + 0.5);
      const sx = (tValue: number) =>
        SLICE.left + ((SLICE.right - SLICE.left) * (tValue + SLICE_HALF)) / (2 * SLICE_HALF);
      const sy = (value: number) => SLICE.bottom - ((SLICE.bottom - SLICE.top) * (value - low)) / (high - low);
      line(
        context,
        [
          [SLICE.left, SLICE.top],
          [SLICE.left, SLICE.bottom],
          [SLICE.right, SLICE.bottom],
        ],
        colors.ink,
        1,
      );
      line(
        context,
        [
          [sx(0), SLICE.top],
          [sx(0), SLICE.bottom],
        ],
        colors.grid,
        1,
      );
      line(
        context,
        g.map(([tValue, value]) => [sx(tValue), sy(value)] as Point),
        colors.ink,
        2.5,
      );
      line(
        context,
        [
          [sx(-reach), sy(f0 - reach * d)],
          [sx(reach), sy(f0 + reach * d)],
        ],
        colors.alternate,
        2.5,
      );
      dot(context, [sx(0), sy(f0)], colors.accent, 5);
      plotLabel(context, t.sliceStringProperty.value, [SLICE.left, SLICE.top - 22], colors.ink);
      plotLabel(context, "f(p + t u)", [SLICE.left + 6, SLICE.top - 4], colors.ink);
      plotLabel(context, format(-SLICE_HALF), [SLICE.left - 6, SLICE.bottom + 16], colors.ink);
      plotLabel(context, "0", [sx(0) - 4, SLICE.bottom + 16], colors.ink);
      plotLabel(context, format(SLICE_HALF), [SLICE.right - 6, SLICE.bottom + 16], colors.ink);
      plotLabel(context, "t", [SLICE.right + 4, SLICE.bottom - 4], colors.ink);
    });
    // Dragging sideways on the 3D view turns it; the view-angle slider owns the keyboard path.
    const turn = new Rectangle(0, 0, SLICE.left - 15, 420, { fill: "transparent", cursor: "ew-resize" });
    let lastX = 0;
    const turnListener = new DragListener({
      start: (event) => {
        lastX = event.pointer.point.x;
      },
      drag: (event) => {
        const next = yawProperty.value + (event.pointer.point.x - lastX) * YAW_PER_PIXEL;
        lastX = event.pointer.point.x;
        yawProperty.value = yawProperty.range.constrainValue(next);
      },
    });
    turn.addInputListener(turnListener);
    plot.addChild(turn);
    plot.addDisposable(turnListener, turn);
    const listParent = new Node();
    super(
      {
        title: manager.getScreenNames().surfaceStringProperty,
        summary: screenSummary,
        details,
        plot,
        listParent,
        controls: [
          comboBox(
            surfaceProperty,
            surfaces.map((surface) => ({
              value: surface,
              label: `f = ${formula(surface)}`,
              name: `f = ${plain(formula(surface))}`,
            })),
            listParent,
            s.surfaceStringProperty,
          ),
          slider(s.xStringProperty, xProperty, 0.05),
          slider(s.yStringProperty, yProperty, 0.05),
          slider(s.angleStringProperty, angleProperty, 5, "°"),
          slider(t.yawStringProperty, yawProperty, 5, "°"),
        ],
        readouts: [formulaLine, coordinates, slope],
        reset: () => model.reset(),
      },
      options,
    );
  }
}
