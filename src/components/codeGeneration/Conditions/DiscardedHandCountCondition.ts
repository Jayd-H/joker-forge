import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../Consumables/gameVariableUtils";

export const generateDiscardedHandCountConditionCode = (
  rules: Rule[],
  itemType: string,
): string | null => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(rules)
  }
  return null
}

const generateJokerCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params.operator as string) || "equals";
  const value = generateGameVariableCode(condition.params.value) || "5";

  let comparison = "";
  switch (operator) {
    case "equals":
      comparison = `== ${value}`;
      return `#context.full_hand == ${value}`;
    case "not_equals":
      return `#context.full_hand ~= ${value}`;
    case "greater_than":
      return `#context.full_hand > ${value}`;
    case "less_than":
      return `#context.full_hand < ${value}`;
    case "greater_equals":
      return `#context.full_hand >= ${value}`;
    case "less_equals":
      return `#context.full_hand <= ${value}`;
    default:
      return `#context.full_hand == ${value}`;
  }
};