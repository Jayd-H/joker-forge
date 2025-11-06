import type { Rule } from "../../../ruleBuilder/types";

export const generateCardSuitConditionCode = (rules: Rule[]): string => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "card_suit") return "";

  const suitType = (condition.params?.suit_type as string) || "specific";
  const specificSuit = condition.params?.specific_suit as string;
  const suitGroup = condition.params?.suit_group as string;

  if (suitType === "specific" && specificSuit) {
    return `card:is_suit("${specificSuit}")`;
  } else if (suitType === "group" && suitGroup) {
    switch (suitGroup) {
      case "red":
        return `(card:is_suit("Hearts") or card:is_suit("Diamonds"))`;
      case "black":
        return `(card:is_suit("Spades") or card:is_suit("Clubs"))`;
      default:
        return "";
    }
  }

  return "";
};
