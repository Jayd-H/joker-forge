import type { Rule } from "../../ruleBuilder/types";
import { getRankId, type JokerData } from "../../data/BalatroUtils";
import { generateValueCode } from "../lib/gameVariableUtils";
import { parseRankVariable } from "../lib/userVariableUtils";

export const generateDiscardedRankCountConditionCode = (
  rules: Rule[],
  itemType: string,
  joker?: JokerData,
):string | null => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(rules, joker)
  }
  return null
}

const generateJokerCode = (
  rules: Rule[],
  joker?: JokerData
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const triggerType = rules[0].trigger || "hand_discarded";

  const rankType = (condition.params?.rank_type?.value as string) || "specific";
  const specificRank = condition.params?.specific_rank;
  const rankGroup = (condition.params?.rank_group?.value as string) || null;
  const quantifier = (condition.params?.quantifier?.value as string) || "at_least_one";
  const count = generateValueCode(condition.params?.count, 'joker');

  const rankVarInfo = parseRankVariable(specificRank, joker);

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

  if (rankType === "specific") {
    if (rankVarInfo.isRankVariable) {
      useVariable = true;
      variableCode = `G.GAME.current_round.${rankVarInfo.variableName}_card.id`;
    } else if (typeof specificRank === "string") {
      ranks = [specificRank];
    }
  } else if (rankType === "group" && rankGroup) {
    rankGroupType = rankGroup;
  }

  if (triggerType === "card_discarded") {
    const checkLogic = getRanksCheckLogic(
      ranks,
      rankGroupType,
      useVariable,
      variableCode,
      "context.other_card"
    );
    return checkLogic;
  }

  switch (quantifier) {
    case "at_least_one":
      return `(function()
    local rankFound = false
    for i, c in ipairs(context.full_hand) do
        if ${getRanksCheckLogic(
          ranks,
          rankGroupType,
          useVariable,
          variableCode
        )} then
            rankFound = true
            break
        end
    end
    
    return rankFound
end)()`;

    case "all":
      return `(function()
    local allMatchRank = true
    for i, c in ipairs(context.full_hand) do
        if not (${getRanksCheckLogic(
          ranks,
          rankGroupType,
          useVariable,
          variableCode
        )}) then
            allMatchRank = false
            break
        end
    end
    
    return allMatchRank and #context.full_hand > 0
end)()`;

    case "exactly":
      return `(function()
    local rankCount = 0
    for i, c in ipairs(context.full_hand) do
        if ${getRanksCheckLogic(
          ranks,
          rankGroupType,
          useVariable,
          variableCode
        )} then
            rankCount = rankCount + 1
        end
    end
    
    return rankCount == ${count}
end)()`;

    case "at_least":
      return `(function()
    local rankCount = 0
    for i, c in ipairs(context.full_hand) do
        if ${getRanksCheckLogic(
          ranks,
          rankGroupType,
          useVariable,
          variableCode
        )} then
            rankCount = rankCount + 1
        end
    end
    
    return rankCount >= ${count}
end)()`;

    case "at_most":
      return `(function()
    local rankCount = 0
    for i, c in ipairs(context.full_hand) do
        if ${getRanksCheckLogic(
          ranks,
          rankGroupType,
          useVariable,
          variableCode
        )} then
            rankCount = rankCount + 1
        end
    end
    
    return rankCount <= ${count} and rankCount > 0
end)()`;

    default:
      return `(function()
    local rankFound = false
    for i, c in ipairs(context.full_hand) do
        if ${getRanksCheckLogic(
          ranks,
          rankGroupType,
          useVariable,
          variableCode
        )} then
            rankFound = true
            break
        end
    end
    
    return rankFound
end)()`;
  }
}