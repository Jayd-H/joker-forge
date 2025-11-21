import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../lib/gameVariableUtils";
import { generateOperationCode } from "../lib/operationUtils";

export const generateBlindRequirementsConditionCode = (
  rules: Rule[],
):string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params.operator?.value as string) || "greater_equals";

  const percentageValue = generateGameVariableCode(condition.params.percentage, 'joker') || 25;

  const decimal = Number(percentageValue) / 100;

  return generateOperationCode(
    operator,
    `G.GAME.chips / G.GAME.blind.chips`,
    `${decimal}`,
  )
};