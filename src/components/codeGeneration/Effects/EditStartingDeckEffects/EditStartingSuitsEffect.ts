import { EDITIONS } from "../../../data/BalatroUtils";
import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../../lib/effectUtils";

export const generateEditStartingSuitsEffectCode = (
  effect: Effect,
  modPrefix: string,
): EffectReturn => {
  const enhancement = effect.params?.enhancement || "none";
  const seal = effect.params?.seal || "none";
  const edition = effect.params?.edition || "none";
  const selected_suit = effect.params?.selected_suit || "Spades";
  const replace_suit = effect.params?.replace_suit || "none";
  
  const hasModifications = [enhancement, seal, edition, selected_suit, replace_suit].some(
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
                        if v.base.suit == '${selected_suit}' then
                        v:set_ability(enhancement)
                        end`
    } else {
        editCardsCode += `
                        if v.base.suit == '${selected_suit}' then
                        v:set_ability('${enhancement}')
                        end`
    } 
  }

  if (seal !== "none") {
    if (seal === "random") {
        editCardsCode += `
                        local seal_pool = {'Gold', 'Red', 'Blue', 'Purple'}
                        local random_seal = pseudorandom_element(seal_pool, 'random_seal')
                        if v.base.suit == '${selected_suit}' then
                        v:set_seal(random_seal, true, true)
                        end`
    } else {
        editCardsCode += `
                        if v.base.suit == '${selected_suit}' then
                        v:set_seal("${seal}", true, true)
                        end`
    }
  }

  if (edition !== "none") {
    if (edition === "random") {
        const editionPool = EDITIONS().map(edition => `'${
                edition.key.startsWith('e_') ? edition.key : `e_${modPrefix}_${edition.key}`}'`)
            editCardsCode += `
                        local edition = pseudorandom_element({${editionPool}}, 'random edition')
                        if v.base.suit == '${selected_suit}' then
                        v:set_edition(edition, true, true)
                        end`
    } else {
        editCardsCode += `
                        if v.base.suit == '${selected_suit}' then
                        v:set_edition( "${edition}", true, true, true)
                        end`
    }
  }


    if (replace_suit !== "none") {
        if (replace_suit === "random") {
        editCardsCode += `
                    local _suit = pseudorandom_element(SMODS.Suits, 'random_suit')
                    if v.base.suit == '${selected_suit}' then
                    assert(SMODS.change_base(v, _suit.key))
                    end`
        } else if (replace_suit === "remove") {
          editCardsCode += `
                    for i=#G.playing_cards, 1, -1 do
              if G.playing_cards[i]:is_suit('${selected_suit}') then
               G.playing_cards[i]:remove()
                end
              end`
         } else {
            editCardsCode += `
                    if v.base.suit == '${selected_suit}' then
                    assert(SMODS.change_base(v, '${replace_suit}'))
                    end`
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