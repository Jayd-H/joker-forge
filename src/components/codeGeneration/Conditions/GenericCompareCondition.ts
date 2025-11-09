import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../lib/gameVariableUtils";
import { generateOperationCode } from "../lib/operationUtils";

export const generateGenericCompareConditionCode = (
  rules: Rule[],
):string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const value1 = generateGameVariableCode(condition.params.value1, '') || "0";
  const operator = (condition.params.operator as string) || "equals";
  const value2 = generateGameVariableCode(condition.params.value2, '') || "0";

  return generateOperationCode(
    operator,
    'equals',
    value1,
    value2
  )
}