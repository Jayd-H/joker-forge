import type { Rule } from "../../../ruleBuilder/types";

export const generateBlindNameConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params.operator as string) || "equals";
  const value = condition.params?.value || "Small Blind";

  let comparison = "";
  switch (operator) {
    case "equals":
      comparison = `== "${value}"`;
      break;
    case "not_equals":
      comparison = `~= "${value}"`;
      break;
    default:
        comparison = `== "${value}"`;
  }

  return `G.GAME.blind.name ${comparison}`;
};
