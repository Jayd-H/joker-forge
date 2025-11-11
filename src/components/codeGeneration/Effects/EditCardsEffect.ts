import { EDITIONS, RANKS, SEALS, SUITS } from "../../data/BalatroUtils";
import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";

export const generateEditCardsEffectCode = (
  effect: Effect,
  itemType: string,
  modPrefix: string,
): EffectReturn => {
  switch(itemType) {
    case "consumable":
      return generateConsumableCode(effect, modPrefix)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateConsumableCode = (
  effect: Effect,
  modPrefix: string,
): EffectReturn => {
  const enhancement = effect.params?.enhancement as string || "none";
  const seal = effect.params?.seal as string || "none";
  const edition = effect.params?.edition as string || "none";
  const suit = effect.params?.suit as string || "none";
  const rank = effect.params?.rank as string || "none";
  const method = effect.params?.method as string || "random";
  const customMessage = effect.customMessage;

  const suitPoolActive = (effect.params.suit_pool as Array<boolean>) || [];
  const suitPoolSuits = SUITS.map(suit => `'${suit.value}'`)
  const rankPoolActive = (effect.params.rank_pool as Array<boolean>) || [];
  const rankPoolRanks = RANKS.map(rank => `'${rank.value}'`)
  
  const hasModifications = [enhancement, seal, edition, suit, rank].some(
    (param) => param !== "none"
  );

  const target = (method === "random") ? "affected_cards" : "G.hand.highlighted" // Butter, it doesn't put "G.hand.highlighted" if the method is "selected"

  if (!hasModifications) {
    return {
      statement: "",
      colour: "G.C.WHITE",
    };
  }

  let editCardsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    play_sound('tarot1')
                    used_card:juice_up(0.3, 0.5)
                    return true
                end
            }))
            for i = 1, #${target} do
                local percent = 1.15 - (i - 0.999) / (#${target} - 0.998) * 0.3
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.15,
                    func = function()
                        ${target}[i]:flip()
                        play_sound('card1', percent)
                        ${target}[i]:juice_up(0.3, 0.3)
                        return true
                    end
                }))
            end
            delay(0.2)`;

    if (enhancement !== "none") {
        editCardsCode += `
            for i = 1, #${target} do
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.1,
                    func = function()`
    if (enhancement === "remove") {
        editCardsCode += `
                        ${target}[i]:set_ability(G.P_CENTERS.c_base)`
    } else if (enhancement === "random") {
        editCardsCode += `
                        local cen_pool = {}
                        for _, enhancement_center in pairs(G.P_CENTER_POOLS["Enhanced"]) do
                            if enhancement_center.key ~= 'm_stone' then
                                cen_pool[#cen_pool + 1] = enhancement_center
                            end
                        end
                        local enhancement = pseudorandom_element(cen_pool, 'random_enhance')
                        ${target}[i]:set_ability(enhancement)`
    } else {
        editCardsCode += `
                        ${target}[i]:set_ability(G.P_CENTERS['${enhancement}'])`
    } 

    editCardsCode += `            
                        return true
                    end
                }))
            end`
  }

  if (seal !== "none") {
    editCardsCode += `
            for i = 1, #${target} do
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.1,
                    func = function()`
    if (seal === "remove") {
        editCardsCode += `
                        ${target}[i]:set_seal(nil, nil, true)`
    } else if (seal === "random") {
        const sealPool = SEALS().map(seal => `'${seal.value}'`)
        editCardsCode += `
                        local seal_pool = {${sealPool}}
                        local random_seal = pseudorandom_element(seal_pool, 'random_seal')
                        ${target}[i]:set_seal(random_seal, nil, true)`
    } else {
        editCardsCode += `
                        ${target}[i]:set_seal("${seal}", nil, true)`
    }
    editCardsCode += `
                        return true
                    end
                }))
            end`
  }

  if (edition !== "none") {
    editCardsCode += `
            for i = 1, #${target} do
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.1,
                    func = function()`

    if (edition === "remove") {
        editCardsCode += `
                        ${target}[i]:set_edition(nil, true)`
    } else if (edition === "random") {
        const editionPool = EDITIONS().map(edition => `'${
                    edition.key.startsWith('e_') ? edition.key : `e_${modPrefix}_${edition.key}`}'`)
        editCardsCode += `
                        local edition = pseudorandom_element({${editionPool}}, 'random edition')
                        ${target}[i]:set_edition(edition, true)`
    } else {
        editCardsCode += `
                        ${target}[i]:set_edition('${edition}', true)`
    }
    
    editCardsCode += `
                        return true
                    end
                }))
            end`
    }


    if (suit !== "none") {
        editCardsCode += `
            for i = 1, #${target} do
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.1,
                    func = function()`
        if (suit === "random") {
        editCardsCode += `
                    local _suit = pseudorandom_element(SMODS.Suits, 'random_suit')
                    assert(SMODS.change_base(${target}[i], _suit.key))`
        } else if (suit === "pool") {

            const suitPool = []
            for (let i = 0; i < suitPoolActive.length; i++){
                if (suitPoolActive[i] == true){
                    suitPool.push(suitPoolSuits[i])
            }}

            editCardsCode += `
                    local suit_pool = {${suitPool}}
                    local _suit = pseudorandom_element(suit_pool, 'random_suit')
                    assert(SMODS.change_base(${target}[i], _suit))`
        } else {
            editCardsCode += `
                    assert(SMODS.change_base(${target}[i], '${suit}'))`
        }
        editCardsCode += `
                        return true
                    end
                }))
            end`;
    }

    if (rank !== "none") {
        editCardsCode += `
            for i = 1, #${target} do
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.1,
                    func = function()`
        if (rank === "random") {
            editCardsCode +=`
                        local _rank = pseudorandom_element(SMODS.Ranks, 'random_rank')
                        assert(SMODS.change_base(${target}[i], nil, _rank.key))`
        } else if (rank === "pool") {
                const rankPool = []
                for (let i = 0; i < rankPoolActive.length; i++){
                    if (rankPoolActive[i] == true){
                        rankPool.push(rankPoolRanks[i])
                }}

                editCardsCode += `
                        local rank_pool = {${rankPool}}
                        local _rank = pseudorandom_element(rank_pool, 'random_rank')
                        assert(SMODS.change_base(${target}[i], _rank))`
        } else {
        editCardsCode += `
                        assert(SMODS.change_base(${target}[i], nil, '${rank}'))`
        }

        editCardsCode += `
                        return true
                    end
                }))
            end`
    }

  editCardsCode += `
            for i = 1, #${target} do
                local percent = 0.85 + (i - 0.999) / (#${target} - 0.998) * 0.3
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.15,
                    func = function()
                        ${target}[i]:flip()
                        play_sound('tarot2', percent, 0.6)
                        ${target}[i]:juice_up(0.3, 0.3)
                        return true
                    end
                }))
            end
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.2,
                func = function()
                    G.hand:unhighlight_all()
                    return true
                end
            }))
            delay(0.5)
            __PRE_RETURN_CODE_END__`;

  const result: EffectReturn = {
    statement: editCardsCode,
    colour: "G.C.SECONDARY_SET.Tarot",
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
}