import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../lib/gameVariableUtils";
import { generateOperationCode } from "../lib/operationUtils";

export const generateHandSizeConditionCode = (
  rules: Rule[],
):string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params.operator.value as string) || "equals";
  const value = generateGameVariableCode(condition.params.value, '') || "8";

  return generateOperationCode(
    operator,
    'G.hand.config.card_limit',
    value,
  )
};