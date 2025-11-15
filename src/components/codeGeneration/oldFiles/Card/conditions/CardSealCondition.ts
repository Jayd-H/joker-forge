import type { Rule } from "../../../ruleBuilder/types";

export const generateCardSealConditionCode = (rules: Rule[]): string => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "card_seal") return "";

  const sealType = (condition.params?.seal as string) || "any";

  const capitalizedSealType =
    sealType === "any"
      ? "any"
      : sealType.charAt(0).toUpperCase() + sealType.slice(1).toLowerCase();

  return sealType === "any"
    ? `card.seal ~= nil`
    : `card.seal == "${capitalizedSealType}"`;
};
