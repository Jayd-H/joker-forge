import { SEALS } from "../../../data/BalatroUtils";
import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditCardsInHandReturn = (effect: Effect): EffectReturn => {
  const enhancement = effect.params?.enhancement as string || "none";
  const seal = effect.params?.seal as string || "none";
  const edition = effect.params?.edition as string || "none";
  const suit = effect.params?.suit as string || "none";
  const rank = effect.params?.rank as string || "none";
  const amount = generateGameVariableCode(effect.params?.amount ?? 1);
  const customMessage = effect.customMessage;
  const suitPoolActive = (effect.params.suit_pool as Array<boolean>) || [];
  const suitPoolSuits = ["'Spades'","'Hearts'","'Diamonds'","'Clubs'"]
  const rankPoolActive = (effect.params.rank_pool as Array<boolean>) || [];
  const rankPoolRanks = [
    "'A'","'2'","'3'","'4'","'5'",
    "'6'","'7'","'8'","'9'","'10'",
    "'J'","'Q'","'K'"
  ]

  // Check if any modifications are actually being made
  const hasModifications = [enhancement, seal, edition, suit, rank].some(
    (param) => param !== "none"
  );

  if (!hasModifications) {
    return {
      statement: "",
      colour: "G.C.WHITE",
    };
  }

  let editCardsCode = `
            local affected_cards = {}
            local temp_hand = {}

            for _, playing_card in ipairs(G.hand.cards) do temp_hand[#temp_hand + 1] = playing_card end
            table.sort(temp_hand,
                function(a, b)
                    return not a.playing_card or not b.playing_card or a.playing_card < b.playing_card
                end
            )

            pseudoshuffle(temp_hand, 12345)

            for i = 1, math.min(card.ability.extra.cards_amount, #temp_hand) do 
                affected_cards[#affected_cards + 1] = temp_hand[i] 
            end

            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    play_sound('tarot1')
                    card:juice_up(0.3, 0.5)
                    return true
                end
            }))
            for i = 1, #affected_cards do
                local percent = 1.15 - (i - 0.999) / (#affected_cards - 0.998) * 0.3
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.15,
                    func = function()
                        affected_cards[i]:flip()
                        play_sound('card1', percent)
                        affected_cards[i]:juice_up(0.3, 0.3)
                        return true
                    end
                }))
            end
            delay(0.2)`;

    if (enhancement !== "none") {
        if (enhancement === "random") {
            editCardsCode += `
                        local cen_pool = {}
                        for _, enhancement_center in pairs(G.P_CENTER_POOLS["Enhanced"]) do
                            if enhancement_center.key ~= 'm_stone' then
                                cen_pool[#cen_pool + 1] = enhancement_center
                            end
                        end
                        local enhancement = pseudorandom_element(cen_pool, 'random_enhance')
                        affected_cards[i]:set_ability(enhancement)`
        } else {
        editCardsCode += `
            for i = 1, #affected_cards do
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.1,
                    func = function()
                        affected_cards[i]:set_ability(G.P_CENTERS['${enhancement}'])`
    }
    editCardsCode += `
                        return true
                    end
                }))
            end`
    }

    if (seal !== "none") {
        editCardsCode += `
            for i = 1, #affected_cards do
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.1,
                    func = function()`
        if (seal === "random") {
            const sealPool = SEALS().map(seal => `'${seal.value}'`)
            editCardsCode += `
                        local seal_pool = {${sealPool}}
                        local random_seal = pseudorandom_element(seal_pool, 'random_seal')
                        affected_cards[i]:set_seal(random_seal, nil, true)`
        } else {
            editCardsCode += `
                        affected_cards[i]:set_seal("${seal}", nil, true)`
        }
        
    editCardsCode += `
                        return true
                    end
                }))
            end`
  }

  if (edition !== "none") {
    if (edition === "random") {
      editCardsCode += `
            for i = 1, #affected_cards do
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.1,
                    func = function()
                        local edition = poll_edition('random_edition', nil, true, true, 
                            { 'e_polychrome', 'e_holo', 'e_foil' })
                        affected_cards[i]:set_edition(edition, true)
                        return true
                    end
                }))
            end`;
    } else {
      editCardsCode += `
            for i = 1, #affected_cards do
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.1,
                    func = function()
                        affected_cards[i]:set_edition('${edition}', true)
                        return true
                    end
                }))
            end`;
    }
  }

    if (suit !== "none") {
        editCardsCode += `
            for i = 1, #affected_cards do
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.1,
                    func = function()`
        if (suit === "random") {
            editCardsCode += `
                        local _suit = pseudorandom_element(SMODS.Suits, 'random_suit')
                        assert(SMODS.change_base(affected_cards[i], _suit.key))`
        } else if (suit === "pool") {

            const suitPool = []
            for (let i = 0; i < suitPoolActive.length; i++){
                if (suitPoolActive[i] == true){
                    suitPool.push(suitPoolSuits[i])
            }}

            editCardsCode += `
                        local suit_pool = {${suitPool}}
                        local _suit = pseudorandom_element(suit_pool, 'random_suit')
                        assert(SMODS.change_base(effected_cards[i], _suit))`
        } else {
            editCardsCode += `
                        assert(SMODS.change_base(affected_cards[i], '${suit}'))`
        }
            editCardsCode += `
                        return true
                    end
                }))
            end`;
    }

    if (rank !== "none") {
        editCardsCode += `
            for i = 1, #affected_cards do
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.1,
                    func = function()`
        if (rank === "random") {
            editCardsCode += `
                        local _rank = pseudorandom_element(SMODS.Ranks, 'random_rank')
                        assert(SMODS.change_base(affected_cards[i], nil, _rank.key))`
        } else if (rank === "pool") {
            const rankPool = []
            for (let i = 0; i < rankPoolActive.length; i++){
                if (rankPoolActive[i] == true){
                    rankPool.push(rankPoolRanks[i])
            }}

            editCardsCode += `
                        local rank_pool = {${rankPool}}
                        local _rank = pseudorandom_element(rank_pool, 'random_rank')
                        assert(SMODS.change_base(affected_cards[i], nil, _rank))`
        } else {
            editCardsCode += `
                        assert(SMODS.change_base(affected_cards[i], nil, '${rank}'))`
        }
        editCardsCode += `
                        return true
                    end
                }))
            end`;
    }

  editCardsCode += `
            for i = 1, #affected_cards do
                local percent = 0.85 + (i - 0.999) / (#affected_cards - 0.998) * 0.3
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.15,
                    func = function()
                        affected_cards[i]:flip()
                        play_sound('tarot2', percent, 0.6)
                        affected_cards[i]:juice_up(0.3, 0.3)
                        return true
                    end
                }))
            end
            delay(0.5)`;

  const result: EffectReturn = {
    statement: editCardsCode,
    colour: "G.C.SECONDARY_SET.Tarot",
    configVariables: [`cards_amount = ${amount}`],
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
