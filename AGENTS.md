# AGENTS.md — Contour Explorer

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenLyceum/.github/AGENTS.md](https://github.com/OpenLyceum/.github/blob/main/AGENTS.md).

## Project

Contour Explorer (`contour-explorer`) is a SceneryStack simulation scaffolded from SceneryStackTemplate.

## Key files

| File | Purpose |
|---|---|
| `src/ContourExplorerColors.ts` | All `ProfileColorProperty` instances |
| `src/ContourExplorerConstants.ts` | Named numeric constants |
| `src/ContourExplorerNamespace.ts` | Namespace for color property names |
| `src/i18n/StringManager.ts` | Singleton localized string accessor |
| `src/common/ContourExplorerPanel.ts` | Pre-themed `Panel` wrapper |
| `src/common/ContourExplorerButtonOptions.ts` | Flat button / combo-box option bundles |
| `src/explore/ExploreScreen.ts` | Screen wrapper |
| `src/explore/model/ExploreModel.ts` | Simulation state and logic |
| `src/explore/view/ExploreScreenView.ts` | Visual nodes, layout, a11y wiring |

## Compliance carve-outs

None yet.

## Testing

See the shared Vitest setup (`vitest.config.ts`, `tests/setup.ts`) and `tests/memory-leak.test.ts` for disposal coverage. Add sim-specific unit tests under `tests/` as physics and UI logic land.

## Accessibility

Follow [Baton/ACCESSIBILITY.md](https://github.com/OpenLyceum/Baton/blob/main/ACCESSIBILITY.md): PDOM names, per-screen `*ScreenSummaryContent`, and keyboard-help content. Document any intentional deviations under Compliance carve-outs.
