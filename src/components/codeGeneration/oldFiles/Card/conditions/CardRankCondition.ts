import type { Rule } from "../../../ruleBuilder/types";
import { getRankId } from "../../../data/BalatroUtils";

export const generateCardRankConditionCode = (rules: Rule[]): string => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "card_rank") return "";

  const rankType = (condition.params?.rank_type as string) || "specific";
  const specificRank = condition.params?.specific_rank as string;
  const rankGroup = condition.params?.rank_group as string;

  if (rankType === "specific" && specificRank) {
    const rankId = getRankId(specificRank);
    return `card:get_id() == ${rankId}`;
  } else if (rankType === "group" && rankGroup) {
    switch (rankGroup) {
      case "face":
        return `card:is_face()`;
      case "even":
        return `(card:get_id() == 2 or card:get_id() == 4 or card:get_id() == 6 or card:get_id() == 8 or card:get_id() == 10)`;
      case "odd":
        return `(card:get_id() == 14 or card:get_id() == 3 or card:get_id() == 5 or card:get_id() == 7 or card:get_id() == 9)`;
      default:
        return "";
    }
  }

  return "";
};
