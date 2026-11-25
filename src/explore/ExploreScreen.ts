/**
 * ExploreScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createExploreIcon() in src/common/ContourExplorerScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import ContourExplorerColors from "../ContourExplorerColors.js";
import { createExploreIcon } from "../common/ContourExplorerScreenIcons.js";
import { ContourModel } from "../common/model/ContourModel.js";
import { ExploreKeyboardHelpContent } from "./view/ExploreKeyboardHelpContent.js";
import { ExploreScreenView } from "./view/ExploreScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type ExploreScreenOptions = ScreenOptions & { tandem: Tandem };

export class ExploreScreen extends Screen<ContourModel, ExploreScreenView> {
  public constructor(options: ExploreScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new ContourModel(),
      // View factory — receives the model instance
      (model) =>
        new ExploreScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<ExploreScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: ContourExplorerColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new ExploreKeyboardHelpContent(),
          homeScreenIcon: createExploreIcon(),
          navigationBarIcon: createExploreIcon(),
        },
        options,
      ),
    );
  }
}
