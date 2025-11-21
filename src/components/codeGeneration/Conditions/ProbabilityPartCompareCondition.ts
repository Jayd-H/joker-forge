import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../lib/gameVariableUtils";
import { generateOperationCode } from "../lib/operationUtils";

export const generateProbabilityPartCompareConditionCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const part = condition.params?.part?.value || "numerator";
  const operator = (condition.params?.operator?.value as string) || "equals";
  const value = generateGameVariableCode(condition.params?.value, '') || "0";
  
  return generateOperationCode(
    operator,
    `context.${part}`,
    value,
  )
}