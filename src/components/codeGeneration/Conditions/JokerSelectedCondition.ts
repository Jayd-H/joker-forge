import type { Rule } from "../../ruleBuilder/types";

export const generateJokerSelectedConditionCode = (
  rules: Rule[],
): string | null => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];

  if (!condition || condition.type !== "joker_selected") return "";

  return `#G.jokers.highlighted == 1`;
}