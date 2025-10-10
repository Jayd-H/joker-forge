import type { Rule } from "../../../ruleBuilder/types";

export const generateJokerKeyConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const jokerKey = (condition.params?.joker_key as string) || "";
  const selectionMethod = (condition.params?.selection_method as string) || "key"
  const jokerVariable = (condition.params?.joker_variable as string) || "j_joker"

  const normalizedJokerKey = jokerKey.startsWith("j_") 
  ? jokerKey 
  : `j_${jokerKey}`

  if (selectionMethod === "key") {
    return `(function()
          return context.other_joker.config.center.key == "${normalizedJokerKey}"
      end)()`
  } else {
    return `(function()
        return context.other_joker.config.center.key == "${jokerVariable}"
    end)()`
  }

;
}