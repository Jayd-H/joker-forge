import type { Rule } from "../../ruleBuilder/types";
import { generateValueCode } from "../lib/gameVariableUtils";

export const generateRankCountConditionCode = (
  rules: Rule[],
  itemType: string,
):string | null => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(rules)
  }
  return null
}

const getRanksCheckLogic = (
  rankType: {value: unknown, valueType?: string} ,
  rankValues: string,
  cardRef: string,
): string => {
  if (rankType.valueType === "user_var") {
    return `${cardRef}:get_id() == G.GAME.current_round.${rankType.value}_card.id`;
  } else if (rankType.value === "specific") {
    return `${cardRef}:get_id() == ${rankValues}`;
  } else if (rankType.value === "group") {
    if (rankValues === "face") {
      return `${cardRef}:is_face()`;
    } else if (rankValues === "even") {
      return `(${cardRef}:get_id() == 2 or ${cardRef}:get_id() == 4 or ${cardRef}:get_id() == 6 or ${cardRef}:get_id() == 8 or ${cardRef}:get_id() == 10)`;
    } else if (rankValues === "odd") {
      return `(${cardRef}:get_id() == 14 or ${cardRef}:get_id() == 3 or ${cardRef}:get_id() == 5 or ${cardRef}:get_id() == 7 or ${cardRef}:get_id() == 9)`;
    }
  }
  return 'true'
};

const generateJokerCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const count = generateValueCode(condition.params?.count, 'joker');
  const scope = (condition.params?.card_scope?.value as string) || "scoring";
  const cardCount = (condition.params?.quantifier?.value as string) || "all";

  const rankType = condition.params?.rank_type;
  const specificRank = (condition.params?.specific_rank?.value) as string;
  const rankGroup = (condition.params?.rank_group?.value) as string;

  const cardsToCheck =
    scope === "scoring" ? "context.scoring_hand" : "context.full_hand";

  let propertyCheck = getRanksCheckLogic(
    rankType, 
    rankType.value === "specific" ? specificRank : rankGroup, 
    cardsToCheck
  )
  let comparison = `count == #context.scoring_hand`
  if (cardCount === "none") {
    comparison = `count == 0`
  } else if (cardCount === "exactly") {
    comparison = `count == ${count}`
  } else if (cardCount === "at_least") {
    comparison = `count >= ${count}`
  } else if (cardCount === "at_most") {
    comparison = `count <= ${count}`
  }

  return `(function()
    local count = 0
    for _, playing_card in pairs(${cardsToCheck} or {}) do
        if ${propertyCheck} then
            count = count + 1
        end
    end
    return ${comparison}
end)()`;
};
