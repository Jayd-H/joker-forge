import type { Rule } from "../../../ruleBuilder/types";

export const generateJokerPositionConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const position = (condition.params.position as string) || "first";
  const specificIndex = condition.params?.specific_index as number;

  switch (position) {
    default:
    case "first":
      return `(function()
        return G.jokers.cards[1] == context.other_joker
    end)()`
    case "last":
      return `(function()
        return G.jokers.cards[#G.jokers.cards] == context.other_joker
    end)()`
    case "specific":
      return `(function()
        return G.jokers.cards[${specificIndex}] == context.other_joker
    end)()`
  }
};

export const generateThisJokerPositionConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const position = (condition.params.position as string) || "first";
  const specificIndex = condition.params?.specific_index as number;

  switch (position) {
    default:
    case "first":
      return `(function()
        return G.jokers.cards[1] == card
    end)()`
    case "last":
      return `(function()
        return G.jokers.cards[#G.jokers.cards] == card
    end)()`
    case "specific":
      return `(function()
        return G.jokers.cards[${specificIndex}] == card
    end)()`
  }
};
