import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../Libs/gameVariableUtils";
import { generateOperationCode } from "../Libs/operationUtils";

export const generateHandCountConditionCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params.operator as string) || "equals";
  const value = generateGameVariableCode(condition.params.value, '') || "5";
  const scope = (condition.params.card_scope as string) || "scoring";

  let cardsToCheck = ""
  switch (scope) {
    case "scoring":
      cardsToCheck = "#context.scoring_hand"
      break
    case "all_played":
      cardsToCheck = "#context.full_hand"
      break
    case "unscored":
      cardsToCheck = "(#context.full_hand - #context.scoring_hand)"
      break
  }  

  return generateOperationCode(
    operator,
    'equals',
    cardsToCheck,
    value
  )
}