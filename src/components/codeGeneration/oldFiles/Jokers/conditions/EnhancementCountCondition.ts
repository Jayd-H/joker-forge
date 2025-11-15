import type { Rule } from "../../../ruleBuilder/types";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEnhancementCountConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params.operator as string) || "equals";
  const value = generateGameVariableCode(condition.params.value);
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
    
  let comparison = "";
  switch (operator) {
    case "equals":
      comparison = `== ${value}`;
      break;
    case "not_equals":
      comparison = `~= ${value}`;
      break;
    case "greater_than":
      comparison = `> ${value}`;
      break;
    case "less_than":
      comparison = `< ${value}`;
      break;
    case "greater_equals":
      comparison = `>= ${value}`;
      break;
    case "less_equals":
      comparison = `<= ${value}`;
      break;
    default:
      comparison = `== ${value}`;
  }

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
