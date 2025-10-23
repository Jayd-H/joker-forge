import { JokerData } from "../data/BalatroUtils";
import { Condition, Rule } from "../ruleBuilder";
import { generatePokerHandConditionCode } from "./Conditions/PokerHandCondition";


export const generateSingleConditionCode = (
  condition: Condition,
  rule: Rule,
  itemType: string,
  joker?: JokerData,
): string | null => {
  const singleConditionRule = {
    ...rule,
    conditionGroups: [
      {
        ...rule.conditionGroups[0],
        conditions: [condition],
      },
    ],
  };

  switch (condition.type) {
    case "hand_type":
      return generatePokerHandConditionCode([singleConditionRule], itemType, joker)
  }
  return null
}