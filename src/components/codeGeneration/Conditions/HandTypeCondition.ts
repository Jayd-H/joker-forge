import type { Rule } from "../../ruleBuilder/types";
import type { JokerData } from "../../data/BalatroUtils";
import { parsePokerHandVariable } from "../lib/userVariableUtils";

export const generatePokerHandConditionCode = (
  rules: Rule[],
  itemType: string,
  joker?: JokerData
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
  const scope = condition.params.card_scope as string || "scoring";
  const operator = condition.params.operator as string || "contains";
  const handType = condition.params.value as string || "High Card";

    if (handType === "most_played_hand") {
      return `(function()
    local current_played = G.GAME.hands[context.scoring_name].played or 0
    for handname, values in pairs(G.GAME.hands) do
        if handname ~= context.scoring_name and values.played > current_played and values.visible then
            return false
        end
    end
    return true
end)()`;
    }

    if (handType === "least_played_hand") {
      return `(function()
    local current_played = G.GAME.hands[context.scoring_name].played or 0
    for handname, values in pairs(G.GAME.hands) do
        if handname ~= context.scoring_name and values.played < current_played and values.visible then
            return false
        end
    end
    return true
end)()`;
    }

    const pokerHandVarInfo = parsePokerHandVariable(handType, joker);
    const handReference = pokerHandVarInfo.isPokerHandVariable 
    ? `G.GAME.current_round.${pokerHandVarInfo.variableName}_hand` 
    : `"${handType}"`

    if (operator === "contains") {
      return `next(context.poker_hands[${handReference}])`;
    }

    if (scope === "scoring") {
      return `context.scoring_name == ${handReference}`;
    } else if (scope === "all_played") {
      return `next(context.poker_hands[${handReference}])`;
    }

    return `true`;
  }