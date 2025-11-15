import type { Rule } from "../../../ruleBuilder/types";
import { generateGameVariableCode } from "../../Jokers/gameVariableUtils";

export const generateCardIndexConditionCode = (rules: Rule[]): string => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "card_index") return "";

  const indexType = (condition.params?.index_type as string) || "number";
  const indexNumber =
    generateGameVariableCode(condition.params?.index_number) || "1";

  if (indexType === "first") {
    return `card == context.scoring_hand[1]`;
  } else if (indexType === "last") {
    return `card == context.scoring_hand[#context.scoring_hand]`;
  } else {
    return `card == context.scoring_hand[${indexNumber}]`;
  }
};
