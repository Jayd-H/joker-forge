import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../Libs/gameVariableUtils";
import { generateOperationCode } from "../Libs/operationUtils";

export const generateEnhancementCountConditionCode = (
  rules: Rule[],
  itemType: string,
):string | null => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(rules)
  }
  return null
}

const generateJokerCode = (
  rules: Rule[],
): string | null => {
 const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params.operator as string) || "equals";
  const value = generateGameVariableCode(condition.params.value, 'joker');
  const scope = (condition.params.card_scope as string) || "scoring";

  let propertyCheck = "";
  const enhancement = condition.params.enhancement as string;
  if (enhancement === "any") {
      propertyCheck = "next(SMODS.get_enhancements(playing_card))";
  } else if (enhancement === "none") {
      propertyCheck = "not next(SMODS.get_enhancements(playing_card))";
  } else {
      propertyCheck = `SMODS.get_enhancements(playing_card)["${enhancement}"] == true`;
  }
    
  const comparison = generateOperationCode(
    operator,
    'equals',
    '',
    value
  )

  const cardsToCheck =
    scope === "scoring" ? "context.scoring_hand" : "context.full_hand";

  return `(function()
    local count = 0
    for _, playing_card in pairs(${cardsToCheck} or {}) do
        if ${propertyCheck} then
            count = count + 1
        end
    end
    return count ${comparison}
end)()`;
};
