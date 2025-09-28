import type { Rule } from "../../../ruleBuilder/types";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generatePlayerMoneyConditionCode = (rules: Rule[]): string => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "player_money") return "";

  const operator = condition.params?.operator || "greater_than";
  const value = condition.params?.value || 0;

  const valueCode = generateGameVariableCode(value);

  switch (operator) {
    case "greater_than":
      return `G.GAME.dollars > ${valueCode}`;
    case "greater_than_or_equal":
      return `G.GAME.dollars >= ${valueCode}`;
    case "less_than":
      return `G.GAME.dollars < ${valueCode}`;
    case "less_than_or_equal":
      return `G.GAME.dollars <= ${valueCode}`;
    case "equal":
      return `G.GAME.dollars == ${valueCode}`;
    case "not_equal":
      return `G.GAME.dollars ~= ${valueCode}`;
    default:
      return `G.GAME.dollars > ${valueCode}`;
  }
};
