import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateRemainingDiscardsConditionCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params.operator as string) || "equals";
  const value = generateGameVariableCode(condition.params.value);

  switch (operator) {
    case "equals":
      return `G.GAME.current_round.discards_left == ${value}`;
    case "not_equals":
      return `G.GAME.current_round.discards_left ~= ${value}`;
    case "greater_than":
      return `G.GAME.current_round.discards_left > ${value}`;
    case "less_than":
      return `G.GAME.current_round.discards_left < ${value}`;
    case "greater_equals":
      return `G.GAME.current_round.discards_left >= ${value}`;
    case "less_equals":
      return `G.GAME.current_round.discards_left <= ${value}`;
    default:
      return `G.GAME.current_round.discards_left == ${value}`;
  }

};
