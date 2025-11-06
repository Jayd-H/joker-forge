import type { Rule } from "../../../ruleBuilder/types";

export const generateJokerStickerConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const sticker = (condition.params.sticker as string) || "eternal";

  return `(function()
    return context.other_joker.ability.${sticker}
end)()`
};

export const generateThisJokerStickerConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const sticker = (condition.params.sticker as string) || "eternal";

  return `(function()
    return card.ability.${sticker}
end)()`
};

