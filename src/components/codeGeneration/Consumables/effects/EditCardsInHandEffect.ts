import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditCardsInHandReturn = (effect: Effect): EffectReturn => {
  const enhancement = effect.params?.enhancement || "none";
  const seal = effect.params?.seal || "none";
  const edition = effect.params?.edition || "none";
  const suit = effect.params?.suit || "none";
  const rank = effect.params?.rank || "none";
  const amount = generateGameVariableCode(effect.params?.amount ?? 1);
  const customMessage = effect.customMessage;

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

  // Apply enhancement if specified
  if (enhancement !== "none") {
    if (enhancement === "random") {
      editCardsCode += `
            for i = 1, #affected_cards do
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.1,
                    func = function()
                        local cen_pool = {}
                        for _, enhancement_center in pairs(G.P_CENTER_POOLS["Enhanced"]) do
                            if enhancement_center.key ~= 'm_stone' then
                                cen_pool[#cen_pool + 1] = enhancement_center
                            end
                        end
                        local enhancement = pseudorandom_element(cen_pool, 'random_enhance')
                        affected_cards[i]:set_ability(enhancement)
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
                        affected_cards[i]:set_ability(G.P_CENTERS['${enhancement}'])
                        return true
                    end
                }))
            end`;
    }
  }

  // Apply seal if specified
  if (seal !== "none") {
    if (seal === "random") {
      editCardsCode += `
            for i = 1, #affected_cards do
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.1,
                    func = function()
                        local seal_pool = {'Gold', 'Red', 'Blue', 'Purple'}
                        local random_seal = pseudorandom_element(seal_pool, 'random_seal')
                        affected_cards[i]:set_seal(random_seal, nil, true)
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
                        affected_cards[i]:set_seal("${seal}", nil, true)
                        return true
                    end
                }))
            end`;
    }
  }

  // Apply edition if specified
  if (edition !== "none") {
    const editionMap: Record<string, string> = {
      e_foil: "foil",
      e_holo: "holo",
      e_polychrome: "polychrome",
      e_negative: "negative",
    };

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
      const editionLua =
        editionMap[edition as keyof typeof editionMap] || "foil";
      editCardsCode += `
            for i = 1, #affected_cards do
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.1,
                    func = function()
                        affected_cards[i]:set_edition({ ${editionLua} = true }, true)
                        return true
                    end
                }))
            end`;
    }
  }

  // Apply suit change if specified
  if (suit !== "none") {
    if (suit === "random") {
      editCardsCode += `
            for i = 1, #affected_cards do
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.1,
                    func = function()
                        local _suit = pseudorandom_element(SMODS.Suits, 'random_suit')
                        assert(SMODS.change_base(affected_cards[i], _suit.key))
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
                        assert(SMODS.change_base(affected_cards[i], '${suit}'))
                        return true
                    end
                }))
            end`;
    }
  }

  // Apply rank change if specified
  if (rank !== "none") {
    if (rank === "random") {
      editCardsCode += `
            for i = 1, #affected_cards do
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.1,
                    func = function()
                        local _rank = pseudorandom_element(SMODS.Ranks, 'random_rank')
                        assert(SMODS.change_base(affected_cards[i], nil, _rank.key))
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
                        assert(SMODS.change_base(affected_cards[i], nil, '${rank}'))
                        return true
                    end
                }))
            end`;
    }
  }

  // Finish the animation sequence
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
