import type { Rule } from "../../ruleBuilder/types";
import { generateOperationCode } from "../lib/operationUtils";

export const generateBoosterPackTypeConditionCode = (
  rules: Rule[],
  itemType: string,
  triggerType: string,
):string | null => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(rules, triggerType)
  }
  return null
}

const generateJokerCode = (
  rules: Rule[],
  triggerType: string,
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const value = condition.params?.value?.value as string || "0";
  const operator = condition.params?.operator?.value as string || "equals"

  const target = 
    (triggerType === 'booster_opened') ? 'card.config.center' : 'booster'

  return generateOperationCode(
    operator,
    `context.${target}.key`,
    value,
  )
}