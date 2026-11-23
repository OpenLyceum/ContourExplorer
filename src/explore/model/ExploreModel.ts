import { BooleanProperty, NumberProperty, StringUnionProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";

export class ExploreModel implements TModel {
  public readonly surfaceProperty = new StringUnionProperty<"bowl" | "saddle">("bowl", {
    validValues: ["bowl", "saddle"],
  });
  public readonly xProperty = new NumberProperty(1, { range: new Range(-2, 2) });
  public readonly yProperty = new NumberProperty(1, { range: new Range(-2, 2) });
  public readonly angleProperty = new NumberProperty(45, { range: new Range(0, 360) });
  public readonly revealProperty = new BooleanProperty(false);
  public readonly properties = [
    this.surfaceProperty,
    this.xProperty,
    this.yProperty,
    this.angleProperty,
    this.revealProperty,
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
