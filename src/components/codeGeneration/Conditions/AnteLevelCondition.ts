import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../Consumables/gameVariableUtils";

export const generateAnteLevelConditionCode = (
  rules: Rule[],
):string | null => {
  const condition = rules[0].conditionGroups?.[0]?.conditions?.[0];
  const operator = condition.params?.operator || "greater_than";
  const value = condition.params?.value ?? 1;

  const valueCode = generateGameVariableCode(value);

  switch (operator) {
    case "greater_than":
      return `G.GAME.round_resets.ante > ${valueCode}`;
    case "greater_than_or_equal":
      return `G.GAME.round_resets.ante >= ${valueCode}`;
    case "less_than":
      return `G.GAME.round_resets.ante < ${valueCode}`;
    case "less_than_or_equal":
      return `G.GAME.round_resets.ante <= ${valueCode}`;
    case "equal":
      return `G.GAME.round_resets.ante == ${valueCode}`;
    case "not_equal":
      return `G.GAME.round_resets.ante ~= ${valueCode}`;
    default:
      return `G.GAME.round_resets.ante > ${valueCode}`;
  }
}