import type { Rule } from "../../../ruleBuilder/types";

export const generateCardEditionConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const triggerType = rules[0].trigger || "hand_played";
  const editionType = (condition.params.edition as string) || "any";

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
