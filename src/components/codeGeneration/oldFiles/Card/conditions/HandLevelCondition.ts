import type { Rule } from "../../../ruleBuilder/types";
import { generateGameVariableCode } from "../../Jokers/gameVariableUtils";

export const generateHandLevelConditionCode = (rules: Rule[]): string => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "hand_level") return "";

  const operator = (condition.params?.operator as string) || "equals";
  const value = generateGameVariableCode(condition.params?.value) || "1";

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

  const handSelection =
    (condition?.params?.hand_selection as string) || "played";
  const specificHand =
    (condition?.params?.specific_hand as string) || "High Card";

  let handDeterminationCode = "";
  switch (handSelection) {
    case "played":
      handDeterminationCode = `hand == context.scoring_name`;
      break;
    case "specific":
      handDeterminationCode = `hand == "${specificHand}"`;
      break;
    case "any":
      handDeterminationCode = `hand`;
      break;
    default:
      handDeterminationCode = `hand == "High Card"`;
  }

  return `(function()
    for hand, data in pairs(G.GAME.hands) do
        if ${handDeterminationCode} and data.level ${comparison} then
            return true
        end
    end
    return false
end)()`;
};
