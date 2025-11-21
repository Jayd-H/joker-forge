import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../lib/gameVariableUtils";
import { generateOperationCode } from "../lib/operationUtils";

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
  const operator = (condition.params?.operator?.value as string) || "equals";
  const value = generateGameVariableCode(condition.params?.value, 'joker');
  const scope = (condition.params?.card_scope?.value as string) || "scoring";

  let propertyCheck = "";
  const enhancement = condition.params?.enhancement?.value as string;
  if (enhancement === "any") {
      propertyCheck = "next(SMODS.get_enhancements(playing_card))";
  } else if (enhancement === "none") {
      propertyCheck = "not next(SMODS.get_enhancements(playing_card))";
  } else {
      propertyCheck = `SMODS.get_enhancements(playing_card)["${enhancement}"] == true`;
  }
    
  const comparison = generateOperationCode(
    operator,
    'count',
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
    return ${comparison}
end)()`;
};
