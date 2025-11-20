import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";
import { getRankId, type JokerData } from "../../data/BalatroUtils";
import { parseRankVariable, parseSuitVariable } from "../lib/userVariableUtils";

export const generateCreateCopyPlayedCardEffectCode = (
  effect: Effect,
  itemType: string,
  triggerType: string,
  joker?: JokerData,
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect, triggerType, joker)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateJokerCode = (
  effect: Effect,
  triggerType: string,
  joker?: JokerData
): EffectReturn => {
  const addTo = (effect.params?.add_to.value as string) || "deck"
  const cardIndex = (effect.params?.card_index.value as string) || "any";
  const cardRank = (effect.params?.card_rank.value as string) || "any";
  const cardSuit = (effect.params?.card_suit.value as string) || "any";

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);
  const customMessage = effect.customMessage;

  const cardSelectionCode = generateCardSelectionLogic(
    cardIndex,
    cardRank,
    cardSuit,
    joker,
  );

  let valueCode = `
    ${cardSelectionCode}
    for i, source_card in ipairs(cards_to_copy) do
        G.playing_card = (G.playing_card and G.playing_card + 1) or 1
        local copied_card = copy_card(source_card, nil, nil, G.playing_card)
        copied_card:add_to_deck()
        G.deck.config.card_limit = G.deck.config.card_limit + 1
        table.insert(G.playing_cards, copied_card)
        G.hand:emplace(copied_card)`

  if (addTo === "hand") {
    valueCode += `
      copied_card.states.visible = nil`
  } else if (addTo === "deck") {
    valueCode += `
      playing_card_joker_effects({true})`
  }

  valueCode += `
    G.E_MANAGER:add_event(Event({
        func = function() 
            copied_card:start_materialize()
            return true
        end
    }))
  end` 
  
  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__${valueCode}
              __PRE_RETURN_CODE_END__`,
      message: customMessage
        ? `"${customMessage}"`
        : `"Copied Card to Hand!"`,
      colour: "G.C.GREEN",
    };
  } else {
    return {
      statement: `
      func = function()
      ${valueCode}
      G.E_MANAGER:add_event(Event({
        func = function()
            SMODS.calculate_context({ playing_card_added = true, cards = { copied_card } })
            return true
        end
    }))
  end`,
      message: customMessage
        ? `"${customMessage}"`
        : `"Copied Card to Hand!"`,
      colour: "G.C.GREEN",
    };
  }
}


const generateCardSelectionLogic = (
  cardIndex: string,
  cardRank: string,
  cardSuit: string,
  joker?: JokerData
): string => {
  const conditions: string[] = [];
  const rankVar = parseRankVariable(cardRank, joker)
  const suitVar = parseSuitVariable(cardSuit, joker)

  if (cardRank !== "any" && !rankVar.isRankVariable) {
    conditions.push(`c:get_id() == ${getRankId(cardRank)}`);
  } else if (rankVar.isRankVariable) {
    conditions.push(`c:get_id() == ${rankVar.code}`)
  }

  if (cardSuit !== "any" && !suitVar.isSuitVariable) {
    conditions.push(`c:is_suit("${cardSuit}")`);
  } else if (suitVar.isSuitVariable) {
    conditions.push(`c:is_suit(${suitVar.code})`)
  }


  if (cardIndex === "any") {
    if (conditions.length === 0) {
      return `
                local cards_to_copy = {}
                for i, c in ipairs(context.full_hand) do
                    table.insert(cards_to_copy, c)
                end`;
    } else {
      const filterCondition = conditions.join(" and ");
      return `
                local cards_to_copy = {}
                for i, c in ipairs(context.full_hand) do
                    if ${filterCondition} then
                        table.insert(cards_to_copy, c)
                    end
                end`;
    }
  } else {
    if (conditions.length === 0) {
      return `
                local cards_to_copy = {}
                local target_index = ${cardIndex}
                if context.full_hand[target_index] then
                    table.insert(cards_to_copy, context.full_hand[target_index])
                end`;
    } else {
      const filterCondition = conditions.join(" and ");
      return `
                local cards_to_copy = {}
                local target_index = ${cardIndex}
                if context.full_hand[target_index] then
                    local c = context.full_hand[target_index]
                    if ${filterCondition} then
                        table.insert(cards_to_copy, c)
                    end
                end`;
    }
  }
}