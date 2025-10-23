import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../Consumables/gameVariableUtils";

export const generateHandSizeConditionCode = (
  rules: Rule[],
):string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params.operator as string) || "equals";
  const value = generateGameVariableCode(condition.params.value) || "8";

  switch (operator) {
    case "equals":
      return `G.hand.config.card_limit == ${value}`;
    case "not_equals":
      return `G.hand.config.card_limit ~= ${value}`;
    case "greater_than":
      return `G.hand.config.card_limit > ${value}`;
    case "less_than":
      return `G.hand.config.card_limit < ${value}`;
    case "greater_equals":
      return `G.hand.config.card_limit >= ${value}`;
    case "less_equals":
      return `G.hand.config.card_limit <= ${value}`;
    default:
      return `G.hand.config.card_limit == ${value}`;
  }

};