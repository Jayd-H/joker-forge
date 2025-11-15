import type { Rule } from "../../../ruleBuilder/types";

export const generateBlindTypeConditionCode = (rules: Rule[]): string => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "blind_type") return "";

  const blindType = (condition.params?.blind_type as string) || "small";

  switch (blindType) {
    case "small":
      return `G.GAME.blind:get_type() == 'Small'`;
    case "big":
      return `G.GAME.blind:get_type() == 'Big'`;
    case "boss":
      return `G.GAME.blind.boss`;
    default:
      return `G.GAME.blind.small`;
  }
};
