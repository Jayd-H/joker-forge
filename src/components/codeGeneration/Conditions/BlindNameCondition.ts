import type { Rule } from "../../ruleBuilder/types";
import { generateOperationCode } from "../lib/operationUtils";

export const generateBlindNameConditionCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params.operator.value as string) || "equals";
  const value = condition.params?.value || "Small Blind";

  return generateOperationCode(
    operator, 
    `G.GAME.blind.name`,
    `"${value}"`
  )
}
