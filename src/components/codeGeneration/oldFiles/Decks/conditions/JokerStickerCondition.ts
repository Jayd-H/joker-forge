import type { Rule } from "../../../ruleBuilder/types";

export const generateJokerStickerConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const sticker = (condition.params.sticker as string) || "eternal";

  return `(function()
    return G.jokers.highlighted[1].ability.${sticker} == true
end)()`
};

