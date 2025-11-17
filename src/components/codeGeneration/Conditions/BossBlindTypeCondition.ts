import type { Rule } from "../../ruleBuilder/types";
import { generateOperationCode } from "../lib/codeGenUtils";

export const generateBossBlindTypeConditionCode = (
  rules: Rule[],
):string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params.operator as string) || "equals";
  const value = condition.params?.value || "bl_hook";

  return generateOperationCode(
    operator,
    `G.GAME.blind.config.blind.key`,
    `"${value}"`
  )
};