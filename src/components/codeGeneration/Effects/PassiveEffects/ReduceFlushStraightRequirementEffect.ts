import type { Effect } from "../../../ruleBuilder/types";
import type { PassiveEffectResult } from "../../lib/effectUtils";

export const generateReduceFlushStraightRequirementsPassiveEffectCode = (
  effect: Effect,
  jokerKey: string
): PassiveEffectResult => {
  const reductionValue = (effect.params?.reduction_value?.value as number) || 1;

  return {
    addToDeck: `-- Flush/Straight requirements reduced by ${reductionValue}`,
    removeFromDeck: `-- Flush/Straight requirements restored`,
    configVariables: [{name: 'reduction_value', value: reductionValue}],
    locVars: [`card.ability.extra.reduction_value`],
    needsHook: {
      hookType: "reduce_flush_straight_requirements",
      jokerKey: jokerKey || "PLACEHOLDER",
      effectParams: {
        reductionValue,
      },
    },
  };
}