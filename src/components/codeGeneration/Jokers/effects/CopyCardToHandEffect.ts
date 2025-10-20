import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import { getRankId, JokerData } from "../../../data/BalatroUtils";
import { parseRankVariable, parseSuitVariable } from "../variableUtils";

export const generateCopyCardToHandReturn = (
  effect: Effect,
  triggerType: string,
  joker?: JokerData
): EffectReturn => {
  const customMessage = effect.customMessage;
  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  if (effect.type === "copy_triggered_card_to_hand") {
    if (isScoring) {
      return {
        statement: `__PRE_RETURN_CODE__
                G.playing_card = (G.playing_card and G.playing_card + 1) or 1
                local copied_card = copy_card(context.other_card, nil, nil, G.playing_card)
                copied_card:add_to_deck()
                G.deck.config.card_limit = G.deck.config.card_limit + 1
                table.insert(G.playing_cards, copied_card)
                G.hand:emplace(copied_card)
                copied_card.states.visible = nil
                
                G.E_MANAGER:add_event(Event({
                    func = function() 
                        copied_card:start_materialize()
                        return true
                    end
                }))
                __PRE_RETURN_CODE_END__`,
        message: customMessage
          ? `"${customMessage}"`
          : `"Copied Card to Hand!"`,
        colour: "G.C.GREEN",
      };
    } else {
      return {
        statement: `func = function()
                        G.playing_card = (G.playing_card and G.playing_card + 1) or 1
                        local copied_card = copy_card(context.other_card, nil, nil, G.playing_card)
                        copied_card:add_to_deck()
                        G.deck.config.card_limit = G.deck.config.card_limit + 1
                        table.insert(G.playing_cards, copied_card)
                        G.hand:emplace(copied_card)
                        copied_card.states.visible = nil
                        
                        G.E_MANAGER:add_event(Event({
                            func = function()
                                copied_card:start_materialize()
                                return true
                            end
                        }))
                        
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

  if (effect.type === "copy_played_card_to_hand") {
    const cardIndex = (effect.params?.card_index as string) || "any";
    const cardRank = (effect.params?.card_rank as string) || "any";
    const cardSuit = (effect.params?.card_suit as string) || "any";

    const cardSelectionCode = generateCardSelectionLogic(
      cardIndex,
      cardRank,
      cardSuit,
      joker,
    );

    if (isScoring) {
      return {
        statement: `__PRE_RETURN_CODE__
                ${cardSelectionCode}
                
                for i, source_card in ipairs(cards_to_copy) do
                    G.playing_card = (G.playing_card and G.playing_card + 1) or 1
                    local copied_card = copy_card(source_card, nil, nil, G.playing_card)
                    copied_card:add_to_deck()
                    G.deck.config.card_limit = G.deck.config.card_limit + 1
                    table.insert(G.playing_cards, copied_card)
                    G.hand:emplace(copied_card)
                    copied_card.states.visible = nil
                    
                    G.E_MANAGER:add_event(Event({
                        func = function() 
                            copied_card:start_materialize()
                            return true
                        end
                    }))
                end
                __PRE_RETURN_CODE_END__`,
        message: customMessage
          ? `"${customMessage}"`
          : `"Copied Cards to Hand!"`,
        colour: "G.C.GREEN",
      };
    } else {
      return {
        statement: `func = function()
                        ${cardSelectionCode}
                        
                        for i, source_card in ipairs(cards_to_copy) do
                            G.playing_card = (G.playing_card and G.playing_card + 1) or 1
                            local copied_card = copy_card(source_card, nil, nil, G.playing_card)
                            copied_card:add_to_deck()
                            G.deck.config.card_limit = G.deck.config.card_limit + 1
                            table.insert(G.playing_cards, copied_card)
                            G.hand:emplace(copied_card)
                            copied_card.states.visible = nil
                            
                            G.E_MANAGER:add_event(Event({
                                func = function()
                                    copied_card:start_materialize()
                                    return true
                                end
                            }))
                            
                            G.E_MANAGER:add_event(Event({
                                func = function()
                                    SMODS.calculate_context({ playing_card_added = true, cards = { copied_card } })
                                    return true
                                end
                            }))
                        end
                    end`,
        message: customMessage
          ? `"${customMessage}"`
          : `"Copied Cards to Hand!"`,
        colour: "G.C.GREEN",
      };
    }
  }

  return {
    statement: `message = "No Card to Copy"`,
    colour: "G.C.RED",
  };
};

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
};
