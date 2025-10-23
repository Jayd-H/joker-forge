import type { Rule } from "../../ruleBuilder/types";

export const generateBossBlindTypeConditionCode = (
  rules: Rule[],
):string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params.operator as string) || "equals";
  const value = condition.params?.value || "bl_hook";

  switch (operator) {
    case "equals":
      return `G.GAME.blind.config.blind.key == "${value}"`;
    case "not_equals":
      return `G.GAME.blind.config.blind.key ~= "${value}"`;
    default:
      return `G.GAME.blind.config.blind.key == "${value}"`;
  }
};