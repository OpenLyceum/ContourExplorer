import { Multilink } from "scenerystack/axon";
import { Range, roundSymmetric } from "scenerystack/dot";
import { Circle, Color, DragListener, Node } from "scenerystack/scenery";
import type { ScreenViewOptions } from "scenerystack/sim";
import Colors from "../../ContourExplorerColors.js";
import {
  addPointDrag,
  arrow,
  checkbox,
  comboBox,
  computed,
  dot,
  format,
  LabView,
  line,
  Plane,
  PlotCanvas,
  plotLabel,
  slider,
} from "../../common/LabView.js";
import {
  contourSegments,
  direction,
  directionalDerivative,
  formula,
  gradient,
  height,
  type Point,
  surfaces,
} from "../../common/model/ContourMath.js";
import { type ContourModel, EXTENT } from "../../common/model/ContourModel.js";
import { type SurfaceData, surfaceData } from "../../common/model/SurfaceData.js";
import { StringManager } from "../../i18n/StringManager.js";

const DOMAIN = new Range(-EXTENT, EXTENT);
const DIRECTION_LENGTH = 0.8;

export class ExploreScreenView extends LabView {
  public constructor(model: ContourModel, options?: ScreenViewOptions) {
    const manager = StringManager.getInstance();
    const { controls: s, screenSummary } = manager.getExploreA11yStrings();
    const { surfaceProperty, xProperty, yProperty, angleProperty, revealProperty, criticalProperty, properties } =
      model;
    const point = (): Point => [xProperty.value, yProperty.value];
    const formulaLine = computed([surfaceProperty], () => `f(x, y) = ${formula(surfaceProperty.value)}`);
    const coordinates = computed(
      properties,
      () =>
        `(x, y) = (${format(xProperty.value)}, ${format(yProperty.value)})    f = ${format(height(surfaceProperty.value, point()))}`,
    );
    const derivative = computed(properties, () => {
      if (!revealProperty.value) {
        return "∇f = ?     D<sub>u</sub>f = ?";
      }
      const [a, b] = gradient(surfaceProperty.value, point());
      return `∇f = (${format(a)}, ${format(b)}),  |∇f| = ${format(Math.hypot(a, b))}    D<sub>u</sub>f = ${format(directionalDerivative(surfaceProperty.value, point(), angleProperty.value))}`;
    });
    const criticalLine = computed([surfaceProperty, criticalProperty], () => {
      if (!criticalProperty.value) {
        return "";
      }
      const found = surfaceData(surfaceProperty.value).critical;
      return found.length === 0
        ? s.noCriticalStringProperty.value
        : found
            .map(({ point: [x, y], kind }) => `${s[`${kind}StringProperty`].value} (${format(x)}, ${format(y)})`)
            .join(" · ");
    });
    const plain = (markup: string) => markup.replace(/<sup>([^<]*)<\/sup>/g, "^($1)").replace(/<[^>]+>/g, "");
    const details = computed(
      [formulaLine, coordinates, derivative, angleProperty, criticalLine],
      () =>
        `${plain(formulaLine.value)}. ${coordinates.value}. ${s.angleStringProperty.value} ${format(angleProperty.value)}°. ${plain(derivative.value)}. ${criticalLine.value}`,
    );
    const plane = new Plane(DOMAIN, DOMAIN);
    const plot = new PlotCanvas(properties, (context, colors) => {
      const surface = surfaceProperty.value;
      const data = surfaceData(surface);
      ExploreScreenView.paintColorMap(context, plane, data);
      plane.axes(context, colors);
      for (const segments of data.contours) {
        for (const [a, b] of segments) {
          line(context, [plane.project(a), plane.project(b)], colors.ink, 1);
        }
      }
      const [x, y] = point();
      const start = plane.project([x, y]);
      const [gx, gy] = gradient(surface, [x, y]);
      const magnitude = Math.hypot(gx, gy);
      // The level curve through the probe, and its tangent line there (perpendicular to ∇f).
      for (const [a, b] of contourSegments(data.grid, EXTENT, height(surface, [x, y]))) {
        line(context, [plane.project(a), plane.project(b)], colors.accent, 3);
      }
      if (magnitude > 1e-9) {
        const [tx, ty] = [-gy / magnitude, gx / magnitude];
        context.setLineDash([6, 4]);
        line(
          context,
          [plane.project([x - 0.7 * tx, y - 0.7 * ty]), plane.project([x + 0.7 * tx, y + 0.7 * ty])],
          colors.accent,
          1.5,
        );
        context.setLineDash([]);
      }
      const [u, v] = direction(angleProperty.value);
      const directionTip = plane.project([x + DIRECTION_LENGTH * u, y + DIRECTION_LENGTH * v]);
      arrow(context, start, directionTip, colors.ink, 3);
      plotLabel(context, "u", [directionTip[0] + 6, directionTip[1] - 6], colors.ink);
      if (revealProperty.value && magnitude > 0) {
        const scale = data.gradientScale;
        const tip = plane.project([x + gx * scale, y + gy * scale]);
        arrow(context, start, tip, colors.alternate, 3);
        plotLabel(context, "∇f", [tip[0] + 5, tip[1] - 5], colors.alternate);
        // D_u f = ∇f · u: the shadow of ∇f on the line of u, drawn to the same scale.
        const slope = gx * u + gy * v;
        const foot = plane.project([x + slope * scale * u, y + slope * scale * v]);
        context.setLineDash([3, 3]);
        line(context, [tip, foot], colors.alternate, 1.5);
        context.setLineDash([]);
        line(context, [start, foot], colors.alternate, 6);
      }
      if (criticalProperty.value) {
        for (const { point: critical, kind } of data.critical) {
          const at = plane.project(critical);
          dot(context, at, kind === "saddle" ? colors.alternate : colors.ink, 6);
          plotLabel(context, s[`${kind}ShortStringProperty`].value, [at[0] + 8, at[1] + 4], colors.ink);
        }
      }
      dot(context, start, colors.accent);
      const step = (data.levels[1] ?? 1) - (data.levels[0] ?? 0);
      plotLabel(context, `${s.levelStepStringProperty.value} ${format(step)}`, [14, 22], colors.ink);
    });
    addPointDrag(plot, plane, xProperty, yProperty, s.dragTargetStringProperty);
    // A grip on the tip of u turns the direction; the angle slider owns the keyboard path.
    const grip = new Circle(9, {
      fill: Colors.textColorProperty,
      stroke: Colors.panelBackgroundColorProperty,
      lineWidth: 2,
      cursor: "pointer",
    });
    grip.touchArea = grip.localBounds.dilated(10);
    const gripListener = new DragListener({
      drag: (event) => {
        const local = plot.globalToLocalPoint(event.pointer.point);
        const [mx, my] = plane.unproject([local.x, local.y]);
        const degrees = (Math.atan2(my - yProperty.value, mx - xProperty.value) * 180) / Math.PI;
        angleProperty.value = angleProperty.range.constrainValue((roundSymmetric(degrees) + 360) % 360);
      },
    });
    grip.addInputListener(gripListener);
    plot.addChild(grip);
    plot.addDisposable(gripListener, grip);
    Multilink.multilink([xProperty, yProperty, angleProperty], (x, y, angle) => {
      const [u, v] = direction(angle);
      const [px, py] = plane.project([x + DIRECTION_LENGTH * u, y + DIRECTION_LENGTH * v]);
      grip.setTranslation(px, py);
    });
    const listParent = new Node();
    super(
      {
        title: manager.getScreenNames().exploreStringProperty,
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
          checkbox(s.revealStringProperty, revealProperty),
          checkbox(s.criticalStringProperty, criticalProperty),
        ],
        readouts: [formulaLine, coordinates, derivative, criticalLine],
        reset: () => model.reset(),
      },
      options,
    );
  }

  /**
   * Cells shaded by height: one hue above the middle level, another below, stronger toward the
   * extremes. Each cell is blended with the background and painted opaque, so overlapping cell
   * edges leave no seams.
   */
  private static paintColorMap(context: CanvasRenderingContext2D, plane: Plane, data: SurfaceData): void {
    const { grid, low, high } = data;
    const middle = low < 0 && high > 0 ? 0 : (low + high) / 2;
    const background = Colors.panelBackgroundColorProperty.value;
    const above = Colors.accentColorProperty.value;
    const below = Colors.secondaryPlotColorProperty.value;
    const mix = (hue: typeof above, amount: number) => Color.interpolateRGBA(background, hue, amount).toCSS();
    const n = grid.length - 1;
    const step = (2 * EXTENT) / n;
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const value = ((grid[j]?.[i] ?? 0) + (grid[j + 1]?.[i + 1] ?? 0)) / 2;
        const weight =
          value >= middle
            ? Math.min(1, (value - middle) / Math.max(1e-9, high - middle))
            : Math.min(1, (middle - value) / Math.max(1e-9, middle - low));
        const [left, top] = plane.project([-EXTENT + i * step, -EXTENT + (j + 1) * step]);
        const [right, bottom] = plane.project([-EXTENT + (i + 1) * step, -EXTENT + j * step]);
        context.fillStyle = mix(value >= middle ? above : below, 0.06 + 0.4 * weight);
        context.fillRect(left, top, right - left + 0.7, bottom - top + 0.7);
      }
    }
  }
}
