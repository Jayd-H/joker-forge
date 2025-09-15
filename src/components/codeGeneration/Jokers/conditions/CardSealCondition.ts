import type { Rule } from "../../../ruleBuilder/types";

export const generateCardSealConditionCode = (rules: Rule[]): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const triggerType = rules[0].trigger || "hand_played";
  const sealType = (condition.params.seal as string) || "any";

  const capitalizedSealType =
    sealType === "any"
      ? "any"
      : sealType.charAt(0).toUpperCase() + sealType.slice(1).toLowerCase();

  if (triggerType === "card_destroyed") {
    if (sealType === "any") {
      return `(function()
    for k, removed_card in ipairs(context.removed) do
        if removed_card.seal ~= nil then
            return true
        end
    end
    return false
end)()`;
    } else {
      return `(function()
    for k, removed_card in ipairs(context.removed) do
        if removed_card.seal == "${capitalizedSealType}" then
            return true
        end
    end
    return false
end)()`;
    }
  }
  if (triggerType === "cards_played_before_scoring"){
    return sealType === "any" ? `used_card.seal ~= nil` : `used_card.seal == "${capitalizedSealType}"`
  }
  return sealType === "any"
    ? `context.other_card.seal ~= nil`
    : `context.other_card.seal == "${capitalizedSealType}"`;
};
