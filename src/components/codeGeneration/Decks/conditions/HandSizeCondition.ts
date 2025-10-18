import type { Rule } from "../../../ruleBuilder/types";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateHandSizeConditionCode = (rules: Rule[]): string => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "hand_size") return "";

  const operator = condition.params?.operator || "greater_than";
  const value = condition.params?.value || 8;

  const valueCode = generateGameVariableCode(value);

  switch (operator) {
    case "greater_than":
      return `G.hand.config.card_limit > ${valueCode}`;
    case "greater_than_or_equal":
      return `G.hand.config.card_limit >= ${valueCode}`;
    case "less_than":
      return `G.hand.config.card_limit < ${valueCode}`;
    case "less_than_or_equal":
      return `G.hand.config.card_limit <= ${valueCode}`;
    case "equal":
      return `G.hand.config.card_limit == ${valueCode}`;
    case "not_equal":
      return `G.hand.config.card_limit ~= ${valueCode}`;
    default:
      return `G.hand.config.card_limit > ${valueCode}`;
  }
};
