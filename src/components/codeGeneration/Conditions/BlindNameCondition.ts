import type { Rule } from "../../ruleBuilder/types";

export const generateBlindNameConditionCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params.operator as string) || "equals";
  const value = condition.params?.value || "Small Blind";

  switch (operator) {
    case "equals":
      return `G.GAME.blind.name == "${value}`;
    case "not_equals":
      return `G.GAME.blind.name ~= "${value}`;
    default:
      return `G.GAME.blind.name == "${value}`;
  }
}
