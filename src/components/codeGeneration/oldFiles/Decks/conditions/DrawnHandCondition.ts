import type { Rule } from "../../../ruleBuilder/types";

export const generateDrawnHandConditionCode = (rules: Rule[]): string => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "hand_drawn") return "";

  return "G.hand and #G.hand.cards > 0";
};
