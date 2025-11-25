import { EDITIONS } from "../../../data/BalatroUtils";
import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../../lib/effectUtils";

export const generateEditStartingCardsEffectCode = (
  effect: Effect,
  modPrefix: string
): EffectReturn => {
  const enhancement = effect.params?.enhancement?.value || "none";
  const seal = effect.params?.seal?.value || "none";
  const edition = effect.params?.edition?.value || "none";
  const suit = effect.params?.suit?.value || "none";
  const rank = effect.params?.rank?.value || "none";
  const suitPoolActive = (effect.params.suit_pool?.value as Array<boolean>) || [];
  const suitPoolSuits = ["'Spades'","'Hearts'","'Diamonds'","'Clubs'"]
  const rankPoolActive = (effect.params.rank_pool?.value as Array<boolean>) || [];
  const rankPoolRanks = [
    "'A'","'2'","'3'","'4'","'5'",
    "'6'","'7'","'8'","'9'","'10'",
    "'J'","'Q'","'K'"
  ]
  
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
            __PRE_RETURN_CODE__
                G.E_MANAGER:add_event(Event({
                    func = function()
                    for k, v in pairs(G.playing_cards) do`;

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
                        v:set_ability(enhancement)`
    } else {
        editCardsCode += `
                        v:set_ability(G.P_CENTERS['${enhancement}'])`
    } 
  }

  if (seal !== "none") {
    if (seal === "random") {
        editCardsCode += `
                        local seal_pool = {'Gold', 'Red', 'Blue', 'Purple'}
                        local random_seal = pseudorandom_element(seal_pool, 'random_seal')
                        v:set_seal(random_seal, nil, true)`
    } else {
        editCardsCode += `
                        v:set_seal("${seal}", true, true)`
    }
  }

  if (edition !== "none") {
 if (edition === "random") {
        const editionPool = EDITIONS().map(edition => `'${
        edition.key.startsWith('e_') ? edition.key : `e_${modPrefix}_${edition.key}`}'`)
    editCardsCode += `
                        local edition = pseudorandom_element({${editionPool}}, 'random edition')
                        v:set_edition(edition, true, true)`
    } else {
        editCardsCode += `
                        v:set_edition( "${edition}", true, true, true)`
    }
  }


    if (suit !== "none") {
        if (suit === "random") {
        editCardsCode += `
                    local _suit = pseudorandom_element(SMODS.Suits, 'random_suit')
                    assert(SMODS.change_base(v, _suit.key))`
        } else if (suit === "pool") {

            const suitPool = []
            for (let i = 0; i < suitPoolActive.length; i++){
                if (suitPoolActive[i] == true){
                    suitPool.push(suitPoolSuits[i])
            }}

            editCardsCode += `
                    local suit_pool = {${suitPool}}
                    local _suit = pseudorandom_element(suit_pool, 'random_suit')
                    assert(SMODS.change_base(v, _suit))`
        } else {
            editCardsCode += `
                    assert(SMODS.change_base(v, '${suit}'))`
        }
    }

    if (rank !== "none") {
        if (rank === "random") {
            editCardsCode +=`
                        local _rank = pseudorandom_element(SMODS.Ranks, 'random_rank')
                        assert(SMODS.change_base(v, nil, _rank.key))`
        } else if (rank === "pool") {
                const rankPool = []
                for (let i = 0; i < rankPoolActive.length; i++){
                    if (rankPoolActive[i] == true){
                        rankPool.push(rankPoolRanks[i])
                }}

                editCardsCode += `
                        local rank_pool = {${rankPool}}
                        local _rank = pseudorandom_element(rank_pool, 'random_rank')
                        assert(SMODS.change_base(v, _rank))`
        } else {
        editCardsCode += `
                        assert(SMODS.change_base(v, nil, '${rank}'))`
        }
    }

  editCardsCode += `
                    end
                    G.GAME.starting_deck_size = #G.playing_cards
                    return true
                end
            }))         
            __PRE_RETURN_CODE_END__`;

  const result: EffectReturn = {
    statement: editCardsCode,
    colour: "G.C.SECONDARY_SET.Tarot",
  };

  return result;
}