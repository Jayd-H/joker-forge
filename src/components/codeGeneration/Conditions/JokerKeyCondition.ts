import type { Rule } from "../../ruleBuilder/types";

export const generateJokerKeyConditionCode = (
  rules: Rule[],
  itemType: string,
):string | null => {
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
  const jokerKey = (condition.params?.joker_key as string) || "";
  const selectionMethod = (condition.params?.selection_method as string) || "key"
  const keyVar = (condition.params?.key_variable as string) || "none"

  const normalizedJokerKey = jokerKey.startsWith("j_") 
  ? jokerKey 
  : `j_${jokerKey}`

  if (selectionMethod === "key") {
    return `(function()
          return context.other_joker.config.center.key == "${normalizedJokerKey}"
      end)()`
  } else {
    return `(function()
        return context.other_joker.config.center.key == card.ability.extra.${keyVar}
    end)()`
  }
}