import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../Libs/gameVariableUtils";
import { generateOperationCode } from "../Libs/operationUtils";

export const generateHandLevelConditionCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params.operator as string) || "equals";
  const value = generateGameVariableCode(condition.params.value, '') || "1";

  const comparison = generateOperationCode(
    operator,
    'equals',
    '',
    value
  )

  const handSelection = (condition?.params?.hand_selection as string) || "played";
  const specificHand = (condition?.params?.specific_hand as string) || "High Card";

  let handDeterminationCode = "";
  switch (handSelection) {
    case "played":
      handDeterminationCode = `hand == context.scoring_name` 
      break
    case "specific":
      handDeterminationCode = `hand == "${specificHand}"`;
      break
    case "any":
      handDeterminationCode = `hand`
      break
    default:
      handDeterminationCode = `hand == "High Card"`
  }

  return `(function()
    for hand, data in pairs(G.GAME.hands) do
        if ${handDeterminationCode} and data.level ${comparison} then
            return true
        end
    end
    return false
  end)()`
};