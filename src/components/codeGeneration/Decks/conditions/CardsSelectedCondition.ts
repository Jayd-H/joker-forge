import type { Rule } from "../../../ruleBuilder/types";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateCardsSelectedConditionCode = (rules: Rule[]): string => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "cards_selected") return "";

  const operator = condition.params?.operator || "greater_than";
  const value = condition.params?.value || 1;

  const valueCode = generateGameVariableCode(value);

  switch (operator) {
    case "greater_than":
      return `#G.hand.highlighted > ${valueCode}`;
    case "greater_equals":
      return `#G.hand.highlighted >= ${valueCode}`;
    case "less_than":
      return `#G.hand.highlighted < ${valueCode}`;
    case "less_equals":
      return `#G.hand.highlighted <= ${valueCode}`;
    case "equals":
      return `#G.hand.highlighted == ${valueCode}`;
    case "not_equal":
      return `#G.hand.highlighted ~= ${valueCode}`;
    default:
      return `#G.hand.highlighted > ${valueCode}`;
  }
};
