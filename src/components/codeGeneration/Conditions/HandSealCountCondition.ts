import type { Rule } from "../../ruleBuilder/types";
import { generateValueCode } from "../lib/gameVariableUtils";
import { generateOperationCode } from "../lib/operationUtils";

export const generateSealCountConditionCode = (
  rules: Rule[],
  itemType: string,
): string | null => {
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
  const value = generateValueCode(condition.params?.value, 'joker');
  const scope = (condition.params?.card_scope?.value as string) || "scoring";

  let propertyCheck = "";
  const seal = condition.params?.seal?.value as string;
  if (seal === "any") {
    propertyCheck = "playing_card.seal ~= nil";
  } else if (seal === "none") {
    propertyCheck = "playing_card.seal == nil";
  } else {
    propertyCheck = `playing_card.seal == "${seal}"`;
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
}