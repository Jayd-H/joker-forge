import type { Rule } from "../../ruleBuilder/types";
import { getRankId } from "../../data/BalatroUtils";
import { generateValueCode } from "../lib/gameVariableUtils";
import { generateOperationCode } from "../lib/operationUtils";

export const generateDeckCountConditionCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const propertyType =
    (condition.params?.property_type?.value as string) || "enhancement";
  const operator = (condition.params?.operator?.value as string);
  const value = generateValueCode(condition.params?.value);
  const rank = (condition.params?.rank?.value as string)
  const suit = (condition.params?.suit?.value as string)
  const enhancement = (condition.params?.enhancement?.value as string)
  const seal = (condition.params?.seal?.value as string)
  const edition = (condition.params?.edition?.value as string)

  let propertyCheck = "";

  switch (propertyType) {
    case "rank": {
      if (rank === "any") {
        propertyCheck = "true";
      } else {
        const rankId = getRankId(rank);
        propertyCheck = `playing_card:get_id() == ${rankId}`;
      }
      break;
    }

    case "suit": {
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

  const comparison = generateOperationCode(
    operator,
    'count',
    value
  )

  return `(function()
    local count = 0
    for _, playing_card in pairs(G.playing_cards or {}) do
        if ${propertyCheck} then
            count = count + 1
        end
    end
    return ${comparison}
end)()`;
};
