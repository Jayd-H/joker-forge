import type { Rule } from "../../ruleBuilder/types";

export const generateCardSealConditionCode = (
  rules: Rule[],
  itemType: string,
): string | null => {

  switch(itemType) {
    case "joker":
      return generateJokerCode(rules)
    case "card":
      return generateCardCode(rules)
  }
  return null
}

const generateJokerCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const triggerType = rules[0].trigger || "hand_played";
  const sealType = (condition.params.seal.value as string) || "any";

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
  
  return sealType === "any"
    ? `context.other_card.seal ~= nil`
    : `context.other_card.seal == "${capitalizedSealType}"`;
};

const generateCardCode = (
  rules: Rule[],
): string | null => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "card_seal") return "";

  const sealType = (condition.params?.seal.value as string) || "any";

  const capitalizedSealType =
    sealType === "any"
      ? "any"
      : sealType.charAt(0).toUpperCase() + sealType.slice(1).toLowerCase();

  return sealType === "any"
    ? `card.seal ~= nil`
    : `card.seal == "${capitalizedSealType}"`;
};