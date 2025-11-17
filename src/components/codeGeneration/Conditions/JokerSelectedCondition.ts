import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../lib/gameVariableUtils";
import { generateOperationCode } from "../lib/codeGenUtils";

export const generateJokerSelectedConditionCode = (
  rules: Rule[],
): string | null => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "joker_selected") return "";

  const operator = condition.params?.operator as string|| "greater_than";
  const value = condition.params?.value || 1;

  const valueCode = generateGameVariableCode(value, '');

  return generateOperationCode(
    operator,
    `#G.jokers.highlighted`,
    valueCode,
  )
}