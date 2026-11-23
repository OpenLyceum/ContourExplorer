/**
 * ContourExplorerPanel.ts
 *
 * A pre-themed Panel that automatically uses ContourExplorerColors for background and
 * border. Use this for all control panels and info boxes in the sim so that
 * default / projector mode switching is handled automatically.
 *
 * ── Basic usage ───────────────────────────────────────────────────────────────
 *
 *   import { ContourExplorerPanel } from "../../common/ContourExplorerPanel.js";
 *   import { VBox, Text } from "scenerystack/scenery";
 *
 *   const content = new VBox({
 *     children: [ new Text("label"), slider ],
 *     spacing: 8,
 *   });
 *   const panel = new ContourExplorerPanel(content);
 *
 * ── Overriding defaults ───────────────────────────────────────────────────────
 *
 *   // Wider margins, sharper corners, custom stroke
 *   const panel = new ContourExplorerPanel(content, { xMargin: 20, cornerRadius: 0 });
 *
 *   // Transparent background (decorative border only)
 *   const panel = new ContourExplorerPanel(content, { fill: "transparent" });
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { Node } from "scenerystack/scenery";
import { Panel, type PanelOptions } from "scenerystack/sun";
import ContourExplorerColors from "../ContourExplorerColors.js";
import { PANEL_CORNER_RADIUS } from "../ContourExplorerConstants.js";

/** @public */
export type ContourExplorerPanelOptions = PanelOptions;

/** Pre-themed Panel wrapper for control panels and info boxes. @public */
export class ContourExplorerPanel extends Panel {
  public constructor(content: Node, providedOptions?: ContourExplorerPanelOptions) {
    const options = optionize<ContourExplorerPanelOptions, EmptySelfOptions, PanelOptions>()(
      {
        fill: ContourExplorerColors.panelBackgroundColorProperty,
        stroke: ContourExplorerColors.panelBorderColorProperty,
        cornerRadius: PANEL_CORNER_RADIUS,
        xMargin: 12,
        yMargin: 10,
      },
      providedOptions,
    );
    super(content, options);
  }
}
