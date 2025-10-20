import type { Rule } from "../../../ruleBuilder/types";

export const generateInBlindConditionCode = (rules: Rule[]): string => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "in_blind") return "";

  return "G.GAME.blind.in_blind";
};
