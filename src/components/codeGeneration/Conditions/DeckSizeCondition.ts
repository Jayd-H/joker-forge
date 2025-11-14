import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../lib/gameVariableUtils";
import { generateOperationCode } from "../lib/operationUtils";

export const generateDeckSizeConditionCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const sizeType = (condition.params.size_type as string) || "remaining";
  const operator = (condition.params.operator as string) || "equals";
  const value = generateGameVariableCode(condition.params.value, '') || "52";

  const comparison = generateOperationCode(
    operator,
    '',
    value
   )

  const deckSizeRef =
    sizeType === "remaining" ? "#G.deck.cards" : "#G.playing_cards";

  return `${deckSizeRef} ${comparison}`;
};
