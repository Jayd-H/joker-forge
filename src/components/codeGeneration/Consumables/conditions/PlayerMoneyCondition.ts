import type { Rule } from "../../../ruleBuilder/types";

export const generatePlayerMoneyConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params?.operator as string) || "greater_equals";
  const value = condition.params?.value || 5;

  let comparison = "";
  switch (operator) {
    case "equals":
      comparison = `== ${value}`;
      break;
    case "greater_than":
      comparison = `> ${value}`;
      break;
    case "less_than":
      comparison = `< ${value}`;
      break;
    case "greater_equals":
      comparison = `>= ${value}`;
      break;
    case "less_equals":
      comparison = `<= ${value}`;
      break;
    default:
      comparison = `>= ${value}`;
  }

  return `G.GAME.dollars ${comparison}`;
};
