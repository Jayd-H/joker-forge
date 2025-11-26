import type { Rule } from "../../ruleBuilder/types";
import { generateValueCode } from "../lib/gameVariableUtils";
import { generateOperationCode } from "../lib/operationUtils";

export const generateRemainingHandsConditionCode = (
  rules: Rule[],
): string | null => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "remaining_hands") return "";

  const operator = (condition.params?.operator?.value as string) || "greater_than";
  const valueCode = generateValueCode(condition.params?.value);

  return generateOperationCode(
    operator,
    `G.GAME.current_round.hands_left`,
    valueCode,
  )
};
