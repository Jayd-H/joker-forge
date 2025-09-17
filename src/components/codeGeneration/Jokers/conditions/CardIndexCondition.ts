import type { Rule } from "../../../ruleBuilder/types";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateCardIndexConditionCode = (
  rules: Rule[]
): string | null => {
  const triggerType = rules[0].trigger || "card_scored";
  const condition = rules[0].conditionGroups[0].conditions[0];
  const indexType = (condition.params.index_type as string) || "number";
  const indexNumber =
    generateGameVariableCode(condition.params.index_number) || "1";

  const handType = triggerType === "card_discarded" ? "full_hand" : "scoring_hand";

  if (indexType === "first") {
    return `context.other_card == context.${handType}[1]`;
  } else if (indexType === "last") {
    return `context.other_card == context.${handType}[#context.${handType}]`;
  } else {
    return `context.other_card == context.${handType}[${indexNumber}]`;
  }
};
