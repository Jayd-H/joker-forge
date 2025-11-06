import type { Rule } from "../../../ruleBuilder/types";

export const generateCardEditionConditionCode = (rules: Rule[]): string => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "card_edition") return "";

  const editionType = (condition.params?.edition as string) || "any";

  if (editionType === "any") {
    return `card.edition ~= nil`;
  } else if (editionType === "none") {
    return `card.edition == nil`;
  } else {
    return `card.edition and card.edition.key == "${editionType}"`;
  }
};
