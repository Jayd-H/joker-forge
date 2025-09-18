import type { Rule } from "../../../ruleBuilder/types";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateGenericCompareConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const value1 = generateGameVariableCode(condition.params.value1) || "0";
  const operator = (condition.params.operator as string) || "equals";
  const value2 = generateGameVariableCode(condition.params.value2) || "0";

  let comparison = "";
  switch (operator) {
    case "equals":
      comparison = `== ${value2}`;
      break;
    case "not_equals":
      comparison = `~= ${value2}`;
      break;
    case "greater_than":
      comparison = `> ${value2}`;
      break;
    case "less_than":
      comparison = `< ${value2}`;
      break;
    case "greater_equals":
      comparison = `>= ${value2}`;
      break;
    case "less_equals":
      comparison = `<= ${value2}`;
      break;
    default:
      comparison = `== ${value2}`;
  }

  return `${value1} ${comparison}`;
};
