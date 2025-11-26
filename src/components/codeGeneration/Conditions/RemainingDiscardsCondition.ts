import type { Rule } from "../../ruleBuilder/types";
import { generateValueCode } from "../lib/gameVariableUtils";
import { generateOperationCode } from "../lib/operationUtils";

export const generateRemainingDiscardsConditionCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params?.operator?.value as string) || "equals";
  const value = generateValueCode(condition.params?.value);

  return generateOperationCode(
    operator,
    `G.GAME.current_round.discards_left`,
    value,
  )
};
