import type { Effect } from "../../../ruleBuilder/types";
import type { PassiveEffectResult } from "../effectUtils";

export const generateReduceFlushStraightRequirementsReturn = (
  effect: Effect,
  jokerKey?: string
): PassiveEffectResult => {
  const reductionValue = (effect.params?.reduction_value as number) || 1;

  return {
    addToDeck: `-- Flush/Straight requirements reduced by ${reductionValue}`,
    removeFromDeck: `-- Flush/Straight requirements restored`,
    configVariables: [`reduction_value = ${reductionValue}`],
    locVars: [`card.ability.extra.reduction_value`],
    needsHook: {
      hookType: "reduce_flush_straight_requirements",
      jokerKey: jokerKey || "PLACEHOLDER",
      effectParams: {
        reductionValue,
      },
    },
  };
};

export const generateReduceFlushStraightRequirementsHook = (
  reductionJokers: Array<{
    jokerKey: string;
    params: {
      reductionValue: number;
    };
  }>,
  modPrefix: string
): string => {
  if (reductionJokers.length === 0) return "";

  let hookCode = `
local smods_four_fingers_ref = SMODS.four_fingers
function SMODS.four_fingers()`;

  reductionJokers.forEach(({ jokerKey, params }) => {
    const fullJokerKey = `j_${modPrefix}_${jokerKey}`;
    const targetValue = 5 - params.reductionValue;

    hookCode += `
    if next(SMODS.find_card("${fullJokerKey}")) then
        return ${targetValue}
    end`;
  });

  hookCode += `
    return smods_four_fingers_ref()
end`;

  return hookCode;
};
