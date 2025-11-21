import type { Rule } from "../../ruleBuilder/types";

export const generateCardEditionConditionCode = (
  rules: Rule[],
  itemType: string,
):string | null => {
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
  const editionType = (condition.params?.edition?.value as string) || "any";

  if (triggerType === "card_destroyed") {
    if (editionType === "any") {
      return `(function()
    for k, removed_card in ipairs(context.removed) do
        if removed_card.edition ~= nil then
            return true
        end
    end
    return false
end)()`;
    } else if (editionType === "none") {
      return `(function()
    for k, removed_card in ipairs(context.removed) do
        if removed_card.edition == nil then
            return true
        end
    end
    return false
end)()`;
    } else {
      return `(function()
    for k, removed_card in ipairs(context.removed) do
        if removed_card.edition and removed_card.edition.key == "${editionType}" then
            return true
        end
    end
    return false
end)()`;
    }
  }

  if (editionType === "any") {
    return `context.other_card.edition ~= nil`;
  } else if (editionType === "none") {
    return `context.other_card.edition == nil`;
  } else {
    return `context.other_card.edition and context.other_card.edition.key == "${editionType}"`;
  }
};

const generateCardCode = (
  rules: Rule[],
): string | null => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "card_edition") return "";

  const editionType = (condition.params?.edition.value as string) || "any";

  if (editionType === "any") {
    return `card.edition ~= nil`;
  } else if (editionType === "none") {
    return `card.edition == nil`;
  } else {
    return `card.edition and card.edition.key == "${editionType}"`;
  }
};