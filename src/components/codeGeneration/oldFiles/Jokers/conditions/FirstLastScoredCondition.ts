import type { Rule } from "../../../ruleBuilder/types";
import type { JokerData } from "../../../data/BalatroUtils";
import { parseRankVariable, parseSuitVariable } from "../variableUtils";
import { getRankId } from "../../../data/BalatroUtils";

export const generateFirstLastScoredConditionCode = (
  rules: Rule[],
  joker?: JokerData
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const position = (condition.params.position as string) || "first";
  const checkType = (condition.params.check_type as string) || "any";
  const specificRank = condition.params.specific_rank;
  const specificSuit = condition.params.specific_suit;

  const rankVarInfo = parseRankVariable(specificRank, joker);
  const suitVarInfo = parseSuitVariable(specificSuit, joker);

  if (checkType === "rank") {
    let rankCheck = "";
    if (rankVarInfo.isRankVariable) {
      rankCheck = `scoring_card:get_id() == ${rankVarInfo.code}`;
    } else if (typeof specificRank === "string") {
      // Handle rank groups
      if (specificRank === "face") {
        rankCheck = `scoring_card:is_face()`;
      } else if (specificRank === "even") {
        rankCheck = `(scoring_card:get_id() == 2 or scoring_card:get_id() == 4 or scoring_card:get_id() == 6 or scoring_card:get_id() == 8 or scoring_card:get_id() == 10)`;
      } else if (specificRank === "odd") {
        rankCheck = `(scoring_card:get_id() == 14 or scoring_card:get_id() == 3 or scoring_card:get_id() == 5 or scoring_card:get_id() == 7 or scoring_card:get_id() == 9)`;
      } else {
        // Handle specific ranks
        const rankId = getRankId(specificRank);
        rankCheck = `scoring_card:get_id() == ${rankId}`;
      }
    }

    if (position === "first") {
      return `(function()
    for i = 1, #context.scoring_hand do
        local scoring_card = context.scoring_hand[i]
        if ${rankCheck} then
            return scoring_card == context.other_card
        end
    end
    return false
end)()`;
    } else {
      return `(function()
    for i = #context.scoring_hand, 1, -1 do
        local scoring_card = context.scoring_hand[i]
        if ${rankCheck} then
            return scoring_card == context.other_card
        end
    end
    return false
end)()`;
    }
  } else if (checkType === "suit") {
    let suitCheck = "";
    if (suitVarInfo.isSuitVariable) {
      suitCheck = `scoring_card:is_suit(${suitVarInfo.code})`;
    } else if (typeof specificSuit === "string") {
      suitCheck = `scoring_card:is_suit("${specificSuit}")`;
    }

    if (position === "first") {
      return `(function()
    for i = 1, #context.scoring_hand do
        local scoring_card = context.scoring_hand[i]
        if ${suitCheck} then
            return scoring_card == context.other_card
        end
    end
    return false
end)()`;
    } else {
      return `(function()
    for i = #context.scoring_hand, 1, -1 do
        local scoring_card = context.scoring_hand[i]
        if ${suitCheck} then
            return scoring_card == context.other_card
        end
    end
    return false
end)()`;
    }
  } else {
    if (position === "first") {
      return `context.other_card == context.scoring_hand[1]`;
    } else {
      return `context.other_card == context.scoring_hand[#context.scoring_hand]`;
    }
  }
};
