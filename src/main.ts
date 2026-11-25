/**
 * main.ts
 *
 * Entry point for the simulation. Initializes SceneryStack, creates the
 * screens, and starts the main event loop.
 *
 * !! CRITICAL IMPORT ORDER !!
 * brand.js MUST be the first import. Each module imports the next, so the import nesting is
 *
 *   main → brand → splash → assert → init
 *
 * and therefore the actual EXECUTION order (deepest import runs first) is the reverse:
 *
 *   init → assert → splash → brand → main
 *
 * SceneryStack requires this exact load order. Never reorder these imports.
 */

// brand.js MUST be first; importing it runs the whole chain (init→assert→splash→brand) before main.
import "./brand.js";

import { onReadyToLaunch, PreferencesModel, Sim } from "scenerystack/sim";
import { Tandem } from "scenerystack/tandem";
import ContourExplorerColors from "./ContourExplorerColors.js";
import { ExploreScreen } from "./explore/ExploreScreen.js";
import { StringManager } from "./i18n/StringManager.js";
import { ContourExplorerPreferencesModel } from "./preferences/ContourExplorerPreferencesModel.js";
import { ContourExplorerPreferencesNode } from "./preferences/ContourExplorerPreferencesNode.js";
import { SurfaceScreen } from "./surface/SurfaceScreen.js";

onReadyToLaunch(() => {
  const stringManager = StringManager.getInstance();

  // Simulation-specific preferences; initial values come from contourExplorerQueryParameters.
  const simPreferences = new ContourExplorerPreferencesModel();

  const screens = [
    new ExploreScreen({
      name: stringManager.getScreenNames().exploreStringProperty,
      tandem: Tandem.ROOT.createTandem("exploreScreen"),
      backgroundColorProperty: ContourExplorerColors.backgroundColorProperty,
    }),
    new SurfaceScreen({
      name: stringManager.getScreenNames().surfaceStringProperty,
      tandem: Tandem.ROOT.createTandem("surfaceScreen"),
      backgroundColorProperty: ContourExplorerColors.backgroundColorProperty,
    }),
  ];

  const sim = new Sim(stringManager.getTitleStringProperty(), screens, {
    preferencesModel: new PreferencesModel({
      visualOptions: {
        // Adds a "Projector Mode" toggle in Preferences → Visual
        supportsProjectorMode: true,
        // Enables keyboard-navigation highlight outlines
        supportsInteractiveHighlights: true,
      },
      simulationOptions: {
        customPreferences: [
          {
            createContent: (tandem: Tandem) => new ContourExplorerPreferencesNode(simPreferences, tandem),
          },
        ],
      },
      localizationOptions: {
        // Adds a language picker in Preferences → Language
        supportsDynamicLocale: true,
      },
    }),

    // Optional: fill in credits shown in Help → About
    credits: {
      leadDesign: "",
      softwareDevelopment: "",
      team: "",
      qualityAssurance: "",
    },
  });

  sim.start();
});
