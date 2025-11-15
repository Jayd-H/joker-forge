import type { Rule } from "../../../ruleBuilder/types";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generatePlayerMoneyConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params.operator as string) || "equals";
  const value = generateGameVariableCode(condition.params.value);

  let comparison = "";
  switch (operator) {
    case "equals":
      comparison = `== to_big(${value})`;
      break;
    case "not_equals":
      comparison = `~= to_big(${value})`;
      break;
    case "greater_than":
      comparison = `> to_big(${value})`;
      break;
    case "less_than":
      comparison = `< to_big(${value})`;
      break;
    case "greater_equals":
      comparison = `>= to_big(${value})`;
      break;
    case "less_equals":
      comparison = `<= to_big(${value})`;
      break;
    default:
      comparison = `== to_big(${value})`;
  }

  return `G.GAME.dollars ${comparison}`;
};
