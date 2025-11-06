import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../Libs/gameVariableUtils";
import { generateOperationCode } from "../Libs/operationUtils";

export const generateAnteLevelConditionCode = (
  rules: Rule[],
):string | null => {
  const condition = rules[0].conditionGroups?.[0]?.conditions?.[0];
  const operator = condition.params?.operator as string|| "greater_than";
  const value = condition.params?.value ?? 1;

  const valueCode = generateGameVariableCode(value, '');
  return generateOperationCode(
    operator, 
    'equals',
    `G.GAME.round_resets.ante`,
    valueCode,
  )
}