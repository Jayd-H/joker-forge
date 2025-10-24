import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateProbabilityPartCompareConditionCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const part = condition.params.part || "numerator";
  const operator = (condition.params.operator as string) || "equals";
  const value = generateGameVariableCode(condition.params.value) || "0";

  switch (operator) {
    case "equals":
      return `context.${part} == ${value}`;
    case "not_equals":
      return `context.${part} ~= ${value}`;
    case "greater_than":
      return `context.${part} > ${value}`;
    case "less_than":
      return `context.${part} < ${value}`;
    case "greater_equals":
      return `context.${part} >= ${value}`;
    case "less_equals":
      return `context.${part} <= ${value}`;
    default:
      return `context.${part} == ${value}`;
  }

}