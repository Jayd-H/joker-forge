import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../lib/gameVariableUtils";

export const generateCardIndexConditionCode = (
  rules: Rule[],
  itemType: string,
):string | null => {
  const triggerType = rules[0].trigger || "card_scored";
  const condition = rules[0].conditionGroups[0].conditions[0];
  const indexType = (condition.params?.index_type?.value as string) || "number";
  const indexNumber =
    generateGameVariableCode(condition.params?.index_number, itemType) || "1";

  let cardValue = ''
  let handType = ''

  switch (itemType){
    case "joker":
      cardValue = 'context.other_card'
      handType = triggerType === "card_discarded" ? "context.full_hand" : "context.scoring_hand"
      break
    case "card":
      cardValue = 'card'
      handType = 'context.scoring_hand'
      break
  }

  if (indexType === "first") {
    return `${cardValue} == ${handType}[1]`;
  } else if (indexType === "last") {
    return `${cardValue} == ${handType}[#${handType}]`;
  } else {
    return `${cardValue} == ${handType}[${indexNumber}]`;
  }
}