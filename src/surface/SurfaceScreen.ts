import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import ContourExplorerColors from "../ContourExplorerColors.js";
import { createSurfaceIcon } from "../common/ContourExplorerScreenIcons.js";
import { ContourModel } from "../common/model/ContourModel.js";
import { SurfaceKeyboardHelpContent } from "./view/SurfaceKeyboardHelpContent.js";
import { SurfaceScreenView } from "./view/SurfaceScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type SurfaceScreenOptions = ScreenOptions & { tandem: Tandem };

/** The surface z = f(x, y) in 3D, with the probe and the slice of the surface along u. */
export class SurfaceScreen extends Screen<ContourModel, SurfaceScreenView> {
  public constructor(options: SurfaceScreenOptions) {
    super(
      () => new ContourModel(),
      (model) => new SurfaceScreenView(model, { tandem: options.tandem.createTandem("view") }),
      optionize<SurfaceScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: ContourExplorerColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new SurfaceKeyboardHelpContent(),
          homeScreenIcon: createSurfaceIcon(),
          navigationBarIcon: createSurfaceIcon(),
        },
        options,
      ),
    );
  }
}
