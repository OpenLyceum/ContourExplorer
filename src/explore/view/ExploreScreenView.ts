import { Range } from "scenerystack/dot";
import type { ScreenViewOptions } from "scenerystack/sim";
import {
  addPointDrag,
  arrow,
  checkbox,
  choice,
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
  direction,
  directionalDerivative,
  gradient,
  height,
  type Point,
  type Surface,
} from "../../common/model/ContourMath.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { ExploreModel } from "../model/ExploreModel.js";

const DOMAIN = new Range(-2.35, 2.35);
const CONTOUR_LEVELS = [0.5, 1, 2, 3, 4];
const CURVE_SAMPLES = 96;

function contours(surface: Surface, level: number): Point[][] {
  if (surface === "bowl") {
    const radius = Math.sqrt(level);
    return [
      Array.from({ length: CURVE_SAMPLES + 1 }, (_, i) => {
        const angle = (i * 2 * Math.PI) / CURVE_SAMPLES;
        return [radius * Math.cos(angle), radius * Math.sin(angle)];
      }),
    ];
  }

  const tLimit = Math.sqrt(DOMAIN.max ** 2 - level);
  return [-1, 1].flatMap((sign) => {
    const branch = Array.from({ length: CURVE_SAMPLES + 1 }, (_, i): Point => {
      const t = tLimit * ((2 * i) / CURVE_SAMPLES - 1);
      return [sign * Math.sqrt(level + t * t), t];
    });
    return [branch, branch.map(([x, y]): Point => [y, x])];
  });
}

export class ExploreScreenView extends LabView {
  public constructor(model: ExploreModel, options?: ScreenViewOptions) {
    const manager = StringManager.getInstance();
    const { controls: s, screenSummary } = manager.getExploreA11yStrings();
    const { surfaceProperty, xProperty, yProperty, angleProperty, revealProperty, properties } = model;
    const point = (): Point => [xProperty.value, yProperty.value];
    const surfaceName = computed(
      [surfaceProperty, s.bowlStringProperty, s.saddleStringProperty],
      () => (surfaceProperty.value === "bowl" ? s.bowlStringProperty : s.saddleStringProperty).value,
    );
    const coordinates = computed(
      properties,
      () =>
        `(x, y) = (${format(xProperty.value)}, ${format(yProperty.value)})    f = ${format(height(surfaceProperty.value, point()))}`,
    );
    const derivative = computed(properties, () => {
      if (!revealProperty.value) {
        return "∇f = ?     Dᵤf = ?";
      }
      const [a, b] = gradient(surfaceProperty.value, point());
      return `∇f = (${format(a)}, ${format(b)})    Dᵤf = ${format(directionalDerivative(surfaceProperty.value, point(), angleProperty.value))}`;
    });
    const details = computed(
      [surfaceName, coordinates, derivative, angleProperty],
      () =>
        `${surfaceName.value}. ${coordinates.value}. ${s.angleStringProperty.value} ${format(angleProperty.value)}°. ${derivative.value}.`,
    );
    const formula = computed([surfaceProperty], () =>
      surfaceProperty.value === "bowl" ? "f(x, y) = x² + y²" : "f(x, y) = x² − y²",
    );
    const plane = new Plane(DOMAIN, DOMAIN);
    const plot = new PlotCanvas(properties, (context, colors) => {
      plane.axes(context, colors);
      const surface = surfaceProperty.value;
      for (const level of CONTOUR_LEVELS) {
        const curves = contours(surface, level);
        curves.forEach((curve, index) => {
          context.setLineDash(index % 2 === 1 ? [4, 3] : []);
          line(context, curve.map(plane.project), index % 2 === 1 ? colors.alternate : colors.ink);
        });
      }
      context.setLineDash([]);
      if (surface === "saddle") {
        for (const sign of [-1, 1]) {
          line(context, [plane.project([-2.25, -sign * 2.25]), plane.project([2.25, sign * 2.25])], colors.ink, 2);
        }
      }
      const [x, y] = point();
      const start = plane.project([x, y]);
      const [u, v] = direction(angleProperty.value);
      const directionTip = plane.project([x + 0.64 * u, y + 0.64 * v]);
      arrow(context, start, directionTip, colors.accent, 3);
      plotLabel(context, "u", [directionTip[0] + 5, directionTip[1] - 5], colors.accent);
      if (revealProperty.value) {
        const [a, b] = gradient(surface, [x, y]);
        const magnitude = Math.hypot(a, b);
        if (magnitude > 0) {
          const scale = Math.min(0.25, 0.85 / magnitude);
          const tip = plane.project([x + a * scale, y + b * scale]);
          arrow(context, start, tip, colors.alternate, 3);
          plotLabel(context, "∇f", [tip[0] + 5, tip[1] - 5], colors.alternate);
        }
      }
      dot(context, start, colors.accent);
      const [legendX, legendY] = [16, 25];
      plotLabel(
        context,
        surface === "bowl" ? "f = 0.5, 1, 2, 3, 4" : "f = 0, ±0.5, ±1, ±2, ±3, ±4",
        [legendX, legendY],
        colors.ink,
      );
    });
    addPointDrag(plot, plane, xProperty, yProperty);
    super(
      {
        title: manager.getTitleStringProperty(),
        summary: screenSummary,
        details,
        plot,
        controls: [
          choice(s.surfaceStringProperty, surfaceName, () => {
            surfaceProperty.value = surfaceProperty.value === "bowl" ? "saddle" : "bowl";
          }),
          slider(s.xStringProperty, xProperty, 0.05),
          slider(s.yStringProperty, yProperty, 0.05),
          slider(s.angleStringProperty, angleProperty, 5, "°"),
          checkbox(s.revealStringProperty, revealProperty),
        ],
        readouts: [formula, coordinates, derivative],
        reset: () => model.reset(),
      },
      options,
    );
  }
}
