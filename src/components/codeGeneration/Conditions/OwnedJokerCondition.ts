import type { Rule } from "../../ruleBuilder/types";

export const generateOwnedJokerConditionCode = (
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
  const jokerKey = (condition.params?.joker_key.value as string) || "";
  const selectionMethod = (condition.params?.type.value as string) || "key"
  const keyVar = (condition.params?.key_variable.value as string) || "none"

  const normalizedJokerKey = jokerKey.startsWith("j_") 
  ? jokerKey 
  : `j_${jokerKey}`
  
  let conditionCode = ''
  if (selectionMethod === "key") {
    conditionCode = `v.config.center.key == "${normalizedJokerKey}"`
  } else {
    conditionCode =  `v.config.center.key == card.ability.extra.${keyVar}`
  }

  conditionCode = `(function()
    for i, v in pairs(G.jokers.cards) do
      if ${conditionCode} then 
        return true
      end
    end
  end)()`

  return conditionCode
}