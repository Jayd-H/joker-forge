import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../Libs/gameVariableUtils";
import { generateOperationCode } from "../Libs/operationUtils";

export const generateBlindRequirementsConditionCode = (
  rules: Rule[],
):string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params.operator as string) || "greater_equals";

  const percentageValue = generateGameVariableCode(condition.params.percentage, 'joker') || 25;

  const decimal = Number(percentageValue) / 100;

  return generateOperationCode(
    operator,
    'greater_equals',
    `G.GAME.chips / G.GAME.blind.chips`,
    `to_big(${decimal})`,
  )
};