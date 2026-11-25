import { Shape } from "scenerystack/kite";
import { Node, Path, Rectangle } from "scenerystack/scenery";
import { ScreenIcon } from "scenerystack/sim";
import Colors from "../ContourExplorerColors.js";

const WIDTH = 548;
const HEIGHT = 373;

function iconFrom(...paths: string[]): ScreenIcon {
  const background = new Rectangle(0, 0, WIDTH, HEIGHT, { fill: Colors.panelBackgroundColorProperty });
  const graphic = paths.map(
    (path, index) =>
      new Path(new Shape(path), {
        stroke: index === 0 ? Colors.accentColorProperty : Colors.secondaryPlotColorProperty,
        lineWidth: 12,
        lineJoin: "round",
        lineCap: "round",
      }),
  );
  return new ScreenIcon(new Node({ children: [background, ...graphic] }), {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1,
    fill: Colors.backgroundColorProperty,
  });
}

export function createExploreIcon(): ScreenIcon {
  return iconFrom(
    "M110 145 C110 64 440 64 440 145 C440 226 110 226 110 145",
    "M166 145 C166 96 384 96 384 145 C384 194 166 194 166 145",
    "M222 145 C222 118 330 118 330 145 C330 172 222 172 222 145",
    "M276 145 L410 71 M374 68 L410 71 L392 101",
  );
}

export function createSurfaceIcon(): ScreenIcon {
  return iconFrom(
    "M90 250 C170 120 230 90 280 150 C330 210 390 180 460 90",
    "M90 250 L280 320 L460 250 M280 150 L280 320",
    "M200 205 L360 175",
  );
}
