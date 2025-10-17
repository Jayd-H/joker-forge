import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import { parseRankVariable, parseSuitVariable } from "../variableUtils";
import { JokerData } from "../../../data/BalatroUtils";
import { EDITIONS, SEALS } from "../../../data/BalatroUtils";

export const generateAddCardToDeckReturn = (
  effect: Effect,
  triggerType: string,
  joker?: JokerData,
): EffectReturn => {
  const suit = (effect.params?.suit as string) || "random";
  const rank = (effect.params?.rank as string) || "random";
  const enhancement = (effect.params?.enhancement as string) || "none";
  const seal = (effect.params?.seal as string) || "none";
  const edition = (effect.params?.edition as string) || "none";

  const customMessage = effect.customMessage;

  const scoringTriggers = ["hand_played", "card_scored"];
  const heldInHandTriggers = ["card_held_in_hand"];

  const isScoring = scoringTriggers.includes(triggerType);
  const isHeldInHand = heldInHandTriggers.includes(triggerType);

  
  const rankVar = parseRankVariable((effect.params?.rank as string) || "", joker);
  const suitVar = parseSuitVariable((effect.params?.suit as string) || "", joker);

  let cardSelectionCode = "";


  if (suit === "random" && rank === "random") {
    cardSelectionCode += "local card_front = pseudorandom_element(G.P_CARDS, pseudoseed('add_card_hand'))";
  } else {
    const suitCode = suitVar.isSuitVariable ? suitVar.code : `'${suit.charAt(0)}'`
    const rankCode = rankVar.isRankVariable ? rankVar.code : `'${rank.charAt(0)}'`

    cardSelectionCode += `
      local allowedSuit = ${suitCode}
      local allowedRank = ${rankCode}
      local possibleValues = {}
      local card_front = G.P_CARDS.H_2


      if allowedSuit == 'r' then 
        allowedSuit = pseudorandom_element({'H','S','D','C'}, "random_suit")
      end
      if allowedSuit == 'H' then 
        possibleValues = {G.P_CARDS.H_2, G.P_CARDS.H_3, G.P_CARDS.H_4, G.P_CARDS.H_5, G.P_CARDS.H_6, G.P_CARDS.H_7, G.P_CARDS.H_8, G.P_CARDS.H_9, G.P_CARDS.H_T, G.P_CARDS.H_J, G.P_CARDS.H_Q, G.P_CARDS.H_K, G.P_CARDS.H_A}
      elseif allowedSuit == 'S' then 
        possibleValues = {G.P_CARDS.S_2, G.P_CARDS.S_3, G.P_CARDS.S_4, G.P_CARDS.S_5, G.P_CARDS.S_6, G.P_CARDS.S_7, G.P_CARDS.S_8, G.P_CARDS.S_9, G.P_CARDS.S_T, G.P_CARDS.S_J, G.P_CARDS.S_Q, G.P_CARDS.S_K, G.P_CARDS.S_A}
      elseif allowedSuit == 'D' then 
        possibleValues = {G.P_CARDS.D_2, G.P_CARDS.D_3, G.P_CARDS.D_4, G.P_CARDS.D_5, G.P_CARDS.D_6, G.P_CARDS.D_7, G.P_CARDS.D_8, G.P_CARDS.D_9, G.P_CARDS.D_T, G.P_CARDS.D_J, G.P_CARDS.D_Q, G.P_CARDS.D_K, G.P_CARDS.D_A}
      else 
        possibleValues = {G.P_CARDS.C_2, G.P_CARDS.C_3, G.P_CARDS.C_4, G.P_CARDS.C_5, G.P_CARDS.C_6, G.P_CARDS.C_7, G.P_CARDS.C_8, G.P_CARDS.C_9, G.P_CARDS.C_T, G.P_CARDS.C_J, G.P_CARDS.C_Q, G.P_CARDS.C_K, G.P_CARDS.C_A}
      end
    
      if allowedRank == 'r' then
        allowedRank = pseudorandom_element({'2','3','4','5','6','7','8','9','T','J','Q','K','A'}, "random_rank")
      end
      if allowedRank == '2' then
        card_front = possibleValues[1]
      elseif allowedRank == '3' then
        card_front = possibleValues[2]
      elseif allowedRank == '4' then
        card_front = possibleValues[3]
      elseif allowedRank == '5' then
        card_front = possibleValues[4]
      elseif allowedRank == '6' then
        card_front = possibleValues[5]
      elseif allowedRank == '7' then
        card_front = possibleValues[6]
      elseif allowedRank == '8' then
        card_front = possibleValues[7]
      elseif allowedRank == '9' then
        card_front = possibleValues[8]
      elseif allowedRank == 'T' then
        card_front = possibleValues[9]
      elseif allowedRank == 'J' then
        card_front = possibleValues[10]
      elseif allowedRank == 'Q' then
        card_front = possibleValues[11]
      elseif allowedRank == 'K' then
        card_front = possibleValues[12]
      else
        card_front = possibleValues[13]
      end
    `
  }

  let centerParam = "";
  if (enhancement === "none") {
    centerParam = `
      G.P_CENTERS.c_base`;
  } else if (enhancement === "random") {
    centerParam =`
      pseudorandom_element({G.P_CENTERS.m_gold, G.P_CENTERS.m_steel, G.P_CENTERS.m_glass, G.P_CENTERS.m_wild, G.P_CENTERS.m_mult, G.P_CENTERS.m_lucky, G.P_CENTERS.m_stone}, pseudoseed('add_card_enhancement'))`
  } else {
    centerParam = `
      G.P_CENTERS.${enhancement}`;
  }

  let sealCode = "";
  if (seal === "random") {
    const sealPool = SEALS().map(seal => `'${seal.value}'`)
    sealCode = `
      new_card:set_seal(pseudorandom_element({${sealPool}}, pseudoseed('add_card_seal')), true)`;
  } else if (seal !== "none") {
    sealCode = `
      new_card:set_seal("${seal}", true)`;
  }

  let editionCode = "";
  if (edition === "random") {
    const editionPool = EDITIONS().map(edition => `'${edition.value}'`)
    editionCode = `
      new_card:set_edition(pseudorandom_element({${editionPool}}, pseudoseed('add_card_edition')), true)`;
  } else if (edition !== "none") {
    editionCode = `
      new_card:set_edition("${edition}", true)`;
  }

  if (isScoring || isHeldInHand) {
    return {
      statement: `__PRE_RETURN_CODE__
                ${cardSelectionCode}
                local base_card = create_playing_card({
                    front = card_front,
                    center = ${centerParam}
                }, G.discard, true, false, nil, true)${sealCode.replace(
                  /new_card/g,
                  "base_card"
                )}${editionCode.replace(/new_card/g, "base_card")}
                
                G.playing_card = (G.playing_card and G.playing_card + 1) or 1
                local new_card = copy_card(base_card, nil, nil, G.playing_card)
                new_card:add_to_deck()
                G.deck.config.card_limit = G.deck.config.card_limit + 1
                G.deck:emplace(new_card)
                table.insert(G.playing_cards, new_card)
                
                base_card:remove()
                
                G.E_MANAGER:add_event(Event({
                    func = function() 
                        new_card:start_materialize()
                        return true
                    end
                }))
                __PRE_RETURN_CODE_END__`,
      message: customMessage ? `"${customMessage}"` : '"Added Card!"',
      colour: "G.C.GREEN",
    };
  } else {
    return {
      statement: `__PRE_RETURN_CODE__
            ${cardSelectionCode}
            local new_card = create_playing_card({
                front = card_front,
                center = ${centerParam}
            }, G.discard, true, false, nil, true)${sealCode}${editionCode}
            
            G.E_MANAGER:add_event(Event({
                func = function()
                    new_card:start_materialize()
                    G.play:emplace(new_card)
                    return true
                end
            }))
            __PRE_RETURN_CODE_END__
            func = function()
                G.E_MANAGER:add_event(Event({
                    func = function()
                        G.deck.config.card_limit = G.deck.config.card_limit + 1
                        return true
                    end
                }))
                draw_card(G.play, G.deck, 90, 'up')
                SMODS.calculate_context({ playing_card_added = true, cards = { new_card } })
            end`,
      message: customMessage ? `"${customMessage}"` : '"Added Card!"',
      colour: "G.C.GREEN",
    };
  }
};
