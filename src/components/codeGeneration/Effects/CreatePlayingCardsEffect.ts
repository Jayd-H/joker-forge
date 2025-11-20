import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";
import { EDITIONS, RANKS, SEALS, SUITS } from "../../data/BalatroUtils";
import { generateConfigVariables } from "../lib/gameVariableUtils";

export const generateCreatePlayingCardsEffectCode = (
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
  const rank = effect.params?.rank as string|| "random";
  const customMessage = effect.customMessage;
  const suitPoolActive = (effect.params.suit_pool as Array<boolean>) || [];
  const rankPoolActive = (effect.params.rank_pool as Array<boolean>) || [];
  const rankPoolRanks = RANKS.map(rank => `'${rank.value}'`)
  const suitPoolSuits = SUITS.map(suit => `'${suit.value}'`)


  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'count',
    'count',
    'consumable'
  );

  let addCardsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.7,
                func = function()
                    local cards = {}
                    for i = 1, ${valueCode} do`;

  // Handle rank selection
  if (rank === "Face Cards") {
    addCardsCode += `
                        local faces = {}
                        for _, rank_key in ipairs(SMODS.Rank.obj_buffer) do
                            local rank = SMODS.Ranks[rank_key]
                            if rank.face then table.insert(faces, rank) end
                        end
                        local _rank = pseudorandom_element(faces, 'add_face_cards').card_key`;
  } else if (rank === "Numbered Cards") {
    addCardsCode += `
                        local numbers = {}
                        for _, rank_key in ipairs(SMODS.Rank.obj_buffer) do
                            local rank = SMODS.Ranks[rank_key]
                            if rank_key ~= 'Ace' and not rank.face then table.insert(numbers, rank) end
                        end
                        local _rank = pseudorandom_element(numbers, 'add_numbered_cards').card_key`;
  } else if (rank === "random") {
    addCardsCode += `
                        local _rank = pseudorandom_element(SMODS.Ranks, 'add_random_rank').card_key`;
  } else if (rank === "pool") {
   const rankPool = []
      for (let i = 0; i < rankPoolActive.length; i++){
        if (rankPoolActive[i] == true){
          rankPool.push(rankPoolRanks[i])
        }}

    addCardsCode += `
                        local rank_pool = {${rankPool}}
                        local _rank = pseudorandom_element(rank_pool, 'random_rank')`
  } else {
    addCardsCode += `
                        local _rank = '${rank}'`;
  }

  if (suit === "random") {
    addCardsCode += `
                        local _suit = pseudorandom_element(SMODS.Suits, 'add_random_suit').key`;
  } else if (suit === "pool") {
    
    const suitPool = []
      for (let i = 0; i < suitPoolActive.length; i++){
        if (suitPoolActive[i] == true){
          suitPool.push(suitPoolSuits[i])
        }}

    addCardsCode += `
                        local suit_pool = {${suitPool}}
                        local _suit = pseudorandom_element(suit_pool, 'random_suit')`
  } else if (suit !== "none") {
    addCardsCode += `
                        local _suit = '${suit}'`;
  } else {
    addCardsCode += `
                        local _suit = nil`;
  }

  if (enhancement === "random") {
    addCardsCode += `
                        local cen_pool = {}
                        for _, enhancement_center in pairs(G.P_CENTER_POOLS["Enhanced"]) do
                            if enhancement_center.key ~= 'm_stone' and not enhancement_center.overrides_base_rank then
                                cen_pool[#cen_pool + 1] = enhancement_center
                            end
                        end
                        local enhancement = pseudorandom_element(cen_pool, 'add_cards_enhancement')`;
  } else if (enhancement !== "none") {
    addCardsCode += `
                        local enhancement = G.P_CENTERS['${enhancement}']`;
  }

  addCardsCode += `
                        local new_card_params = { set = "Base" }
                        if _rank then new_card_params.rank = _rank end
                        if _suit then new_card_params.suit = _suit end`;

  if (enhancement !== "none") {
    addCardsCode += `
                        if enhancement then new_card_params.enhancement = enhancement.key end`;
  }

  addCardsCode += `
                        cards[i] = SMODS.add_card(new_card_params)`;

  if (seal !== "none") {
    if (seal === "random") {
      const sealPool = SEALS().map(seal => `'${seal.value}'`)
      addCardsCode += `
                        if cards[i] then
                            local seal_pool = {${sealPool}}
                            local random_seal = pseudorandom_element(seal_pool, 'add_cards_seal')
                            cards[i]:set_seal(random_seal, nil, true)
                        end`;
    } else {
      addCardsCode += `
                        if cards[i] then
                            cards[i]:set_seal('${seal}', nil, true)
                        end`;
    }
  }

  if (edition !== "none") {
    if (edition === "random") {
      const editionPool = EDITIONS().map(edition => `'${
                  edition.key.startsWith('e_') ? edition.key : `e_${modPrefix}_${edition.key}`}'`)
      addCardsCode += `
                        if cards[i] then
                            local edition = pseudorandom_element({${editionPool}}, 'random edition')
                            cards[i]:set_edition(edition, true)
                        end`;
    } else {
      addCardsCode += `
                        if cards[i] then
                            cards[i]:set_edition('${edition}', true)
                        end`;
    }
  }

  addCardsCode += `
                    end
                    SMODS.calculate_context({ playing_card_added = true, cards = cards })
                    return true
                end
            }))
            delay(0.3)
            __PRE_RETURN_CODE_END__`;

  const result: EffectReturn = {
    statement: addCardsCode,
    colour: "G.C.SECONDARY_SET.Spectral",
    configVariables
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
