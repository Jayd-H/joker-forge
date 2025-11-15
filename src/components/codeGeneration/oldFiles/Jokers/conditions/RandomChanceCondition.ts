//! THIS FILE IS DEPRECIATED BUT IM KEEPING IT HERE BECAUSE IT MIGHT BE USEFUL LATER

import type { Rule } from "../../../ruleBuilder/types";

export const generateRandomChanceConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const numerator = condition.params.numerator as number;
  const denominator = (condition.params.denominator as number) || 4;

  return `pseudorandom('random_chance') < G.GAME.probabilities.normal * ${numerator} / ${denominator}`;
};
