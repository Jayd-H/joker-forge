import type { Rule } from "../../../ruleBuilder/types";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateSealCountConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params.operator as string) || "equals";
  const value = generateGameVariableCode(condition.params.value);
  const scope = (condition.params.card_scope as string) || "scoring";

  let propertyCheck = "";
  const seal = condition.params.seal as string;
  if (seal === "any") {
  propertyCheck = "playing_card.seal ~= nil";
  } else if (seal === "none") {
  propertyCheck = "playing_card.seal == nil";
  } else {
  propertyCheck = `playing_card.seal == "${seal}"`;
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
