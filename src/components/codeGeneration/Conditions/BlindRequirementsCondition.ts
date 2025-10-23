import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../Jokers/gameVariableUtils";

export const generateBlindRequirementsConditionCode = (
  rules: Rule[],
):string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params.operator as string) || "greater_equals";
  const percentageValue =
    generateGameVariableCode(condition.params.percentage) || 25;

  const decimal = Number(percentageValue) / 100;

  switch (operator) {
    case "equals":
      return `G.GAME.chips / G.GAME.blind.chips == to_big(${decimal})`;
    case "not_equals":
      return `G.GAME.chips / G.GAME.blind.chips ~= to_big(${decimal})`;
    case "greater_than":
      return `G.GAME.chips / G.GAME.blind.chips > to_big(${decimal})`;
    case "less_than":
      return `G.GAME.chips / G.GAME.blind.chips < to_big(${decimal})`;
    case "greater_equals":
      return `G.GAME.chips / G.GAME.blind.chips >= to_big(${decimal})`;
    case "less_equals":
      return `G.GAME.chips / G.GAME.blind.chips <= to_big(${decimal})`;
    default:
      return `G.GAME.chips / G.GAME.blind.chips >= to_big(${decimal})`;
  }

};