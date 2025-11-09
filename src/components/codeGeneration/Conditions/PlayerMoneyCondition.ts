import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../lib/gameVariableUtils";
import { generateOperationCode } from "../lib/operationUtils";

export const generatePlayerMoneyConditionCode = (
  rules: Rule[],
): string | null => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "player_money") return "";

  const operator = condition.params?.operator as string || "greater_than";
  const value = condition.params?.value || 0;

  const valueCode = generateGameVariableCode(value, '');

  return generateOperationCode(
    operator,
    'greater_than',
    `G.GAME.dollars`,
    valueCode,
  )
};
