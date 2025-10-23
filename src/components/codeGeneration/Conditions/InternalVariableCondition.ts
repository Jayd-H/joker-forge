import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../Consumables/gameVariableUtils";

export const generateInternalVariableConditionCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const variableName = (condition.params.variable_name as string) || "var1";
  const operator = (condition.params.operator as string) || "equals";
  const value = generateGameVariableCode(condition.params.value) || "0";

  switch (operator) {
    case "equals":
      return `(card.ability.extra.${variableName} or 0) == ${value}`;
    case "not_equals":
      return `(card.ability.extra.${variableName} or 0) ~= ${value}`;
    case "greater_than":
      return `(card.ability.extra.${variableName} or 0) > ${value}`;
    case "less_than":
      return `(card.ability.extra.${variableName} or 0) < ${value}`;
    case "greater_equals":
      return `(card.ability.extra.${variableName} or 0) >= ${value}`;
    case "less_equals":
      return `(card.ability.extra.${variableName} or 0) <= ${value}`;
    default:
      return `(card.ability.extra.${variableName} or 0) == ${value}`;
  }

};
