import type { Rule } from "../../../ruleBuilder/types";
import { generateGameVariableCode } from "../../Jokers/gameVariableUtils";

export const generateDeckSizeConditionCode = (rules: Rule[]): string => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "deck_size") return "";

  const sizeType = (condition.params?.size_type as string) || "remaining";
  const operator = (condition.params?.operator as string) || "equals";
  const value = generateGameVariableCode(condition.params?.value) || "52";

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

  const deckSizeRef =
    sizeType === "remaining" ? "#G.deck.cards" : "#G.playing_cards";

  return `${deckSizeRef} ${comparison}`;
};
