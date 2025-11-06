import { EDITIONS, getRankId } from "../../../data/BalatroUtils";
import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../../Libs/effectUtils";

export const generateEditStartingRanksEffectCode = (
  effect: Effect,
  modPrefix: string,
): EffectReturn => {
  const enhancement = effect.params?.enhancement || "none";
  const seal = effect.params?.seal || "none";
  const edition = effect.params?.edition || "none";
  const specific_selected_Rank = effect.params?.specific_selected_Rank as string;
  const specific_replace_Rank = effect.params?.specific_replace_Rank as string;
  
  const hasModifications = [enhancement, seal, edition, specific_selected_Rank, specific_replace_Rank].some(
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
 
    const rankId = getRankId(specific_selected_Rank);
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
                        if v:get_id() == ${rankId} then
                        v:set_ability(enhancement)
                        end`
    } else {
        editCardsCode += `
                        if v:get_id() == ${rankId} then
                        v:set_ability('${enhancement}')
                        end`
    } 
  }


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
                        if v:get_id() == ${rankId} then
                        v:set_ability(enhancement)
                        end`
    } else {
        editCardsCode += `
                        if v:get_id() == ${rankId} then
                        v:set_ability('${enhancement}')
                        end`
    } 
  }

  if (seal !== "none") {
    if (seal === "random") {
        editCardsCode += `
                        local seal_pool = {'Gold', 'Red', 'Blue', 'Purple'}
                        local random_seal = pseudorandom_element(seal_pool, 'random_seal')
                        if v:get_id() == ${rankId} then
                        v:set_seal(random_seal, true, true)
                        end`
    } else {
        editCardsCode += `
                        if v:get_id() == ${rankId} then
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
                        if v:get_id() == ${rankId} then
                        v:set_edition(edition, true, true)
                        end`
    } else {
        editCardsCode += `
                        if v:get_id() == ${rankId} then
                        v:set_edition( "${edition}", true, true, true)
                        end`
    }
  }


    if (specific_replace_Rank !== "none") {
        if (specific_replace_Rank === "random") {
            editCardsCode +=`
                        local _rank = pseudorandom_element(SMODS.Ranks, 'random_rank')
                        if v:get_id() == ${rankId} then
                        assert(SMODS.change_base(v, nil, _rank.key))
                        end`
        } else if (specific_replace_Rank === "remove") {
          editCardsCode += `
                    if v:get_id() == ${rankId} then
                    v:remove()
                    end`
        } else {  
        editCardsCode += `
                        if v:get_id() == ${rankId} then
                        assert(SMODS.change_base(v, nil, "${specific_replace_Rank}"))
                        end                        `
        }
}  

  editCardsCode += `
                    end
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