import type { Rule } from "../../../ruleBuilder/types";

export const generateJokerKeyConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const jokerKey = (condition.params?.joker_key as string) || "";

  const normalizedJokerKey = jokerKey.startsWith("j_") 
  ? jokerKey 
  : `j_${jokerKey}`

  return `(function()
        return context.other_joker.config.center.key == "${normalizedJokerKey}"
    end)()`;
}