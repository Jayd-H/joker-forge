import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../lib/gameVariableUtils";
import { generateOperationCode } from "../lib/operationUtils";

export const generateCardsSelectedConditionCode = (
  rules: Rule[],
  itemType: string,
): string | null => {
  switch(itemType) {
    case "consumable":
      return generateConsumableCode(rules)
  }
  return null
}

const generateConsumableCode = (
  rules: Rule[],
): string | null => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "cards_selected") return "";

  const operator = condition.params?.operator?.value as string || "greater_than";
  const value = condition.params?.value

  const valueCode = generateGameVariableCode(value, 'consumable');

  return generateOperationCode(
    operator,
    `#G.hand.highlighted`,
    valueCode
  )
}