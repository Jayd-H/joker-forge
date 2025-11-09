import type { Rule } from "../../../ruleBuilder/types";
import { generateGameVariableCode } from "../gameVariableUtils";
import { getRankId } from "../../../data/BalatroUtils";

export const generateDeckCountConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const propertyType =
    (condition.params.property_type as string) || "enhancement";
  const operator = (condition.params.operator as string) || "equals";
  const value = generateGameVariableCode(condition.params.value);

  let propertyCheck = "";

  switch (propertyType) {
    case "rank": {
      const rank = condition.params.rank as string;
      if (rank === "any") {
        propertyCheck = "true";
      } else {
        const rankId = getRankId(rank);
        propertyCheck = `playing_card:get_id() == ${rankId}`;
      }
      break;
    }

    case "suit": {
      const suit = condition.params.suit as string;
      if (suit === "any") {
        propertyCheck = "true";
      } else if (suit === "red") {
        propertyCheck = `(playing_card:is_suit("Hearts") or playing_card:is_suit("Diamonds"))`;
      } else if (suit === "black") {
        propertyCheck = `(playing_card:is_suit("Spades") or playing_card:is_suit("Clubs"))`;
      } else {
        propertyCheck = `playing_card:is_suit("${suit}")`;
      }
      break;
    }

    case "enhancement": {
      const enhancement = condition.params.enhancement as string;
      if (enhancement === "any") {
        propertyCheck = "next(SMODS.get_enhancements(playing_card))";
      } else if (enhancement === "none") {
        propertyCheck = "not next(SMODS.get_enhancements(playing_card))";
      } else {
        propertyCheck = `SMODS.get_enhancements(playing_card)["${enhancement}"] == true`;
      }
      break;
    }

    case "seal": {
      const seal = condition.params.seal as string;
      if (seal === "any") {
        propertyCheck = "playing_card.seal ~= nil";
      } else if (seal === "none") {
        propertyCheck = "playing_card.seal == nil";
      } else {
        propertyCheck = `playing_card.seal == "${seal}"`;
      }
      break;
    }

    case "edition": {
      const edition = condition.params.edition as string;
      if (edition === "any") {
        propertyCheck = "playing_card.edition ~= nil";
      } else if (edition === "none") {
        propertyCheck = "playing_card.edition == nil";
      } else {
        propertyCheck = `playing_card.edition and playing_card.edition.key == "${edition}"`;
      }
      break;
    }

    default:
      propertyCheck = "true";
  }

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

  return `(function()
    local count = 0
    for _, playing_card in pairs(G.playing_cards or {}) do
        if ${propertyCheck} then
            count = count + 1
        end
    end
    return count ${comparison}
end)()`;
};
