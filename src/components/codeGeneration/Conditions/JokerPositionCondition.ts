import type { Rule } from "../../ruleBuilder/types";

export const generateJokerPositionConditionCode = (
  rules: Rule[],
  itemType: string,
  target: string,
):string | null => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(rules, target)
  }
  return null
}

const generateJokerCode = (
  rules: Rule[],
  target: string,
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const position = (condition.params?.position?.value as string) || "first";
  const specificIndex = condition.params?.specific_index?.value as number;

  const valueCode = (target === "self" ? "card" : "context.other_joker")

  switch (position) {
    default:
    case "first":
      return `(function()
        return G.jokers.cards[1] == ${valueCode}
    end)()`
    case "last":
      return `(function()
        return G.jokers.cards[#G.jokers.cards] == ${valueCode}
    end)()`
    case "specific":
      return `(function()
        return G.jokers.cards[${specificIndex}] == ${valueCode}
    end)()`
  }
}