import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../Consumables/gameVariableUtils";

export const generateGenericCompareConditionCode = (
  rules: Rule[],
):string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const value1 = generateGameVariableCode(condition.params.value1) || "0";
  const operator = (condition.params.operator as string) || "equals";
  const value2 = generateGameVariableCode(condition.params.value2) || "0";

  switch (operator) {
    case "equals":
      return `${value1} == ${value2}`;
    case "not_equals":
      return `${value1} ~= ${value2}`;
    case "greater_than":
      return `${value1} > ${value2}`;
    case "less_than":
      return `${value1} < ${value2}`;
    case "greater_equals":
      return `${value1} >= ${value2}`;
    case "less_equals":
      return `${value1} <= ${value2}`;
    default:
      return `${value1} == ${value2}`;
  }

}