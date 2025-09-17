import type { Rule } from "../../../ruleBuilder/types";

export const generateCardEnhancementConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const triggerType = rules[0].trigger || "hand_played";
  const enhancementType = (condition.params.enhancement as string) || "any";

  if (triggerType === "card_destroyed") {
    if (enhancementType === "any") {
      return `(function()
    for k, removed_card in ipairs(context.removed) do
        local enhancements = SMODS.get_enhancements(removed_card)
        for k, v in pairs(enhancements) do
            if v then
                return true
            end
        end
    end
    return false
end)()`;
    } else {
      return `(function()
    for k, removed_card in ipairs(context.removed) do
        if SMODS.get_enhancements(removed_card)["${enhancementType}"] == true then
            return true
        end
    end
    return false
end)()`;
    }
  }

  if (enhancementType === "any") {
    return `(function()
        local enhancements = SMODS.get_enhancements(context.other_card)
        for k, v in pairs(enhancements) do
            if v then
                return true
            end
        end
        return false
    end)()`;
  } else {
    return `SMODS.get_enhancements(context.other_card)["${enhancementType}"] == true`;
  }
};
