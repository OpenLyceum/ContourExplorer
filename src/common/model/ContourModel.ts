import { BooleanProperty, NumberProperty, StringUnionProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { type Surface, surfaces } from "./ContourMath.js";

export { EXTENT } from "../../ContourExplorerConstants.js";

/**
 * The probe (x, y), the direction angle of u, and the chosen surface, shared in shape by both
 * screens (each has its own instance). The Surface screen also turns its 3D view with `yawProperty`.
 */
export class ContourModel implements TModel {
  public readonly surfaceProperty = new StringUnionProperty<Surface>("bowl", { validValues: surfaces });
  public readonly xProperty = new NumberProperty(1, { range: new Range(-2.3, 2.3) });
  public readonly yProperty = new NumberProperty(1, { range: new Range(-2.3, 2.3) });
  public readonly angleProperty = new NumberProperty(45, { range: new Range(0, 360) });
  public readonly revealProperty = new BooleanProperty(false);
  public readonly criticalProperty = new BooleanProperty(false);
  public readonly yawProperty = new NumberProperty(-35, { range: new Range(-90, 90) });
  public readonly properties = [
    this.surfaceProperty,
    this.xProperty,
    this.yProperty,
    this.angleProperty,
    this.revealProperty,
    this.criticalProperty,
    this.yawProperty,
  ] as const;

  public reset(): void {
    for (const property of this.properties) {
      property.reset();
    }
  }

  public dispose(): void {
    for (const property of this.properties) {
      property.dispose();
    }
  }
}
