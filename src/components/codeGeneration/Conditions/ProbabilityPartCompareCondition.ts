import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../Libs/gameVariableUtils";
import { generateOperationCode } from "../Libs/operationUtils";

export const generateProbabilityPartCompareConditionCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const part = condition.params.part || "numerator";
  const operator = (condition.params.operator as string) || "equals";
  const value = generateGameVariableCode(condition.params.value, '') || "0";
  
  return generateOperationCode(
    operator,
    'equals',
    `context.${part}`,
    value,
  )
}