import type { Rule } from "../../ruleBuilder/types";

export const generateJokerKeyConditionCode = (
  rules: Rule[],
  itemType: string,
): string | null => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(rules)
  }
  return null
}

const generateJokerCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const jokerKey = (condition.params?.joker_key?.value as string) || "";
  const selectionMethod = (condition.params?.selection_method?.value as string) || "key"
  const keyVar = (condition.params?.key_variable?.value as string) || "none"

  const normalizedJokerKey = jokerKey.startsWith("j_") 
  ? jokerKey 
  : `j_${jokerKey}`

  if (selectionMethod === "key") {
    return `context.other_joker.config.center.key == "${normalizedJokerKey}"`
  } else {
    return `context.other_joker.config.center.key == card.ability.extra.${keyVar}`
  }
}