import type { Rule } from "../../ruleBuilder/types";
import { generateValueCode } from "../lib/gameVariableUtils";
import { generateOperationCode } from "../lib/operationUtils";

export const generateAnteLevelConditionCode = (
  rules: Rule[],
):string | null => {
  const condition = rules[0].conditionGroups?.[0]?.conditions?.[0];
  const operator = condition.params?.operator?.value as string || "greater_than";
  const value = condition.params?.value ?? 1;

  const valueCode = generateValueCode(value, '');
  return generateOperationCode(
    operator, 
    `G.GAME.round_resets.ante`,
    valueCode,
  )
}