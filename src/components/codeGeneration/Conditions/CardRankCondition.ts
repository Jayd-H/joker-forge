import type { Rule } from "../../ruleBuilder/types";
import { getRankId } from "../../data/BalatroUtils";

export const generateCardRankConditionCode = (
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

  const rankType = condition.params.rank_type
  const specificRank = condition.params.specific_rank
  const rankGroup = condition.params.rank_group || null;

  const getRanksCheckLogic = (
    ranks: string[],
    rankGroupType: string | null,
    useVariable = false,
    varCode?: string,
    cardRef = "c"
  ): string => {
    if (useVariable && varCode) {
      return `${cardRef}:get_id() == ${varCode}`;
    } else if (rankGroupType === "face") {
      return `${cardRef}:is_face()`;
    } else if (rankGroupType === "even") {
      return `(${cardRef}:get_id() == 2 or ${cardRef}:get_id() == 4 or ${cardRef}:get_id() == 6 or ${cardRef}:get_id() == 8 or ${cardRef}:get_id() == 10)`;
    } else if (rankGroupType === "odd") {
      return `(${cardRef}:get_id() == 14 or ${cardRef}:get_id() == 3 or ${cardRef}:get_id() == 5 or ${cardRef}:get_id() == 7 or ${cardRef}:get_id() == 9)`;
    } else if (ranks.length === 1) {
      const rankId = getRankId(ranks[0]);
      return `${cardRef}:get_id() == ${rankId}`;
    } else {
      return ranks
        .map((rank) => `${cardRef}:get_id() == ${getRankId(rank)}`)
        .join(" or ");
    }
  };

  let ranks: string[] = [];
  let rankGroupType: string | null = null;
  let useVariable = false;
  let variableCode = "";

  if (rankType.value === "specific") {
    if (rankType.valueType === "user_var") {
      useVariable = true;
      variableCode = `G.GAME.current_round.${rankType.value}_card.id`;
    } else if (typeof specificRank.value === "string") {
      ranks = [specificRank.value];
    }
  } else if (rankType.value === "group" && rankGroup) {
    rankGroupType = rankGroup.value as string;
  }

  if (triggerType === "card_destroyed") {
    const checkLogic = getRanksCheckLogic(
      ranks,
      rankGroupType,
      useVariable,
      variableCode,
      "removed_card"
    );
    return `(function()
    for k, removed_card in ipairs(context.removed) do
        if ${checkLogic} then
            return true
        end
    end
    return false
end)()`;
  }

  const checkLogic = getRanksCheckLogic(
    ranks,
    rankGroupType,
    useVariable,
    variableCode,
    "context.other_card"
  );
  return checkLogic;
};

const generateCardCode = (
  rules: Rule[],
): string | null => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "card_rank") return "";

  const rankType = (condition.params?.rank_type.value as string) || "specific";
  const specificRank = condition.params?.specific_rank.value as string;
  const rankGroup = condition.params?.rank_group.value as string;

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
}