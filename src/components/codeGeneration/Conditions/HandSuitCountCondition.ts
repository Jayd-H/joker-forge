import type { Rule } from "../../ruleBuilder/types";
import { generateValueCode } from "../lib/gameVariableUtils";

export const generateSuitCountConditionCode = (
  rules: Rule[],
  itemType: string,
):string | null => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(rules)
  }
  return null
}

const getSuitsCheckLogic = (
  suitType: {value: unknown, valueType?: string} ,
  suitValues: string,
  cardRef: string,
): string => {
  if (suitType.valueType === "user_var") {
    return `${cardRef}:is_suit(G.GAME.current_round.${suitType.value}_card.suit)`;
  } else if (suitType.value === "specific") {
    return `${cardRef}:is_suit("${suitValues}")`;
  } else if (suitType.value === "group") {
    if (suitValues === "red") {
      return `${cardRef}:is_suit("Hearts") or ${cardRef}:is_suit("Diamonds")`;
    } else if (suitValues === "black") {
      return `${cardRef}:is_suit("Spades") or ${cardRef}:is_suit("Clubs")`;
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

  const suitType = condition.params?.suit_type;
  const specificSuit = (condition.params?.specific_suit?.value) as string;
  const suitGroup = (condition.params?.suit_group?.value) as string;

  const cardsToCheck =
    scope === "scoring" ? "context.scoring_hand" : "context.full_hand";

  let propertyCheck = getSuitsCheckLogic(
    suitType, 
    suitType.value === "specific" ? specificSuit : suitGroup, 
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
