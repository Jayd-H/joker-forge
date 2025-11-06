import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../Libs/gameVariableUtils";
import { generateOperationCode } from "../Libs/operationUtils";

export const generateRemainingDiscardsConditionCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params.operator as string) || "equals";
  const value = generateGameVariableCode(condition.params.value, '');

  return generateOperationCode(
    operator,
    'equals',
    `G.GAME.current_round.discards_left`,
    value,
  )
};
