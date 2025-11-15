import type { Rule } from "../../../ruleBuilder/types";

export const generateSpecificJokerConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params.operator as string) || "has";
  const jokerKey = (condition.params.joker_key as string) || "j_joker";

  // Ensure the joker key has the j_ prefix if not provided
  const normalizedJokerKey = jokerKey.startsWith("j_")
    ? jokerKey
    : `j_${jokerKey}`;

  if (operator === "has") {
    return `(function()
      for i = 1, #G.jokers.cards do
          if G.jokers.cards[i].config.center.key == "${normalizedJokerKey}" then
              return true
          end
      end
      return false
  end)()`;
  } else if (operator === "does_not_have") {
    return `(function()
      for i = 1, #G.jokers.cards do
          if G.jokers.cards[i].config.center.key == "${normalizedJokerKey}" then
              return false
          end
      end
      return true
  end)()`;
  }

  return null;
};
