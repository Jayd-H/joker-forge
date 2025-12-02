import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";
import { EDITIONS, RANKS, SEALS } from "../../data/BalatroUtils";

export const generateCreatePlayingCardEffectCode = (
  effect: Effect,
  itemType: string,
  triggerType: string,
  modprefix: string,
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect, triggerType, modprefix,)
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
  modprefix: string,
): EffectReturn => {
  const suit = effect.params?.suit
  const rank = effect.params?.rank
  const enhancement = effect.params?.enhancement
  const seal = effect.params?.seal
  const edition = effect.params?.edition
  const location = (effect.params?.location?.value as string) || "deck";

  const customMessage = effect.customMessage;

  const scoringTriggers = ["hand_played", "card_scored"];
  const heldInHandTriggers = ["card_held_in_hand"];

  const isScoring = scoringTriggers.includes(triggerType);
  const isHeldInHand = heldInHandTriggers.includes(triggerType);

  let cardSelectionCode = "";

  if (suit.value === "random" && rank.value === "random") {
    cardSelectionCode += "local card_front = pseudorandom_element(G.P_CARDS, pseudoseed('add_card_hand'))";
  } else {
    const suitCode = suit.valueType === "user_var" ? `G.GAME.current_round.${suit.value}_card.suit` : `'${(suit.value as string).charAt(0)}'`
    const rankCode = rank.valueType === "user_var" ?`G.GAME.current_round.${rank.value}_card.id` : `'${(rank.value as string).charAt(0)}'`

    if (suitCode === `'r'`) { 
      cardSelectionCode += `
        local suit_prefix = pseudorandom_element({'H','S','D','C'}, "random_suit")`
    } else {
      cardSelectionCode += `
        local suit_prefix = ${suitCode}`
    }

    if (rankCode === `'r'`) { 
      cardSelectionCode += `
        local rank_suffix = pseudorandom_element({${RANKS.map(rank => `'${rank.value}'`)}}, "random_rank")`
    } else {
      cardSelectionCode += `
        local rank_suffix = ${rankCode}`
    }

    cardSelectionCode += `
      local card_front = G.P_CARDS[suit_prefix..rank_suffix]`
  }

  let centerParam = "";
  if (enhancement.value === "none") {
    centerParam = `G.P_CENTERS.c_base`;
  } else if (enhancement.value === "random") {
    centerParam = `pseudorandom_element({G.P_CENTERS.m_gold, G.P_CENTERS.m_steel, G.P_CENTERS.m_glass, G.P_CENTERS.m_wild, G.P_CENTERS.m_mult, G.P_CENTERS.m_lucky, G.P_CENTERS.m_stone}, pseudoseed('add_card_hand_enhancement'))`;
  } else if (enhancement.valueType === "user_var"){
    centerParam = `G.P_CENTERS.[card.ability.extra.${enhancement.value}]`;
  } else {
    centerParam = `G.P_CENTERS.${enhancement.value}`;
  }

  let sealCode = "";
  if (seal.value === "random") {
    const sealPool = SEALS().map(seal => `'${seal.value}'`)
    sealCode = `
      new_card:set_seal(pseudorandom_element({${sealPool}}, pseudoseed('add_card_hand_seal')), true)`;
  } else if (seal.valueType === "user_var"){
    sealCode = `
      new_card:set_seal(card.ability.extra.${seal.value}, true)`;
  } else if (seal.value !== "none") {
    sealCode = `
      new_card:set_seal("${seal.value}", true)`;
  }

  let editionCode = "";
  if (edition.value === "random") {
    const editionPool = EDITIONS().map(edition => `'${
      edition.key.startsWith('e_') ? edition.key : `e_${modprefix}_${edition.key}`}'`)    
       editionCode = `
      new_card:set_edition(pseudorandom_element({${editionPool}}, pseudoseed('add_card_hand_edition')), true)`;
  } else if (edition.valueType === "user_var"){
    editionCode = `
      new_card:set_edition(card.ability.extra.${edition.value}, true)`;
  } else if (edition.value !== "none") {
    editionCode = `
      new_card:set_edition("${(edition.value as string).startsWith('e_') ? edition.value : `e_${edition.value}`}", true)`;
  }
  
  if (location === "deck") {
    if (isScoring || isHeldInHand) {
      return {
        statement: `__PRE_RETURN_CODE__
                ${cardSelectionCode}
                local base_card = create_playing_card({
                    front = card_front,
                    center = ${centerParam}
                }, G.discard, true, false, nil, true)
                ${sealCode.replace(/new_card/g, "base_card")}
                ${editionCode.replace(/new_card/g, "base_card")}
                
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
            local base_card = create_playing_card({
                front = card_front,
                center = ${centerParam}
            }, G.discard, true, false, nil, true)
            ${sealCode.replace(/new_card/g, "base_card")}
            ${editionCode.replace(/new_card/g, "base_card")}
            
            G.E_MANAGER:add_event(Event({
                func = function()
                    base_card:start_materialize()
                    G.play:emplace(base_card)
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
                SMODS.calculate_context({ playing_card_added = true, cards = { base_card } })
            end`,
        message: customMessage ? `"${customMessage}"` : '"Added Card!"',
        colour: "G.C.GREEN",
      };
    }
  } else if (location === "hand") {
    if (isScoring || isHeldInHand) {
      return {
        statement: `__PRE_RETURN_CODE__
                  ${cardSelectionCode}
                  local base_card = create_playing_card({
                      front = card_front,
                      center = ${centerParam}
                  }, G.discard, true, false, nil, true)
                  ${sealCode.replace(/new_card/g, "base_card")}
                  ${editionCode.replace(/new_card/g, "base_card")}
                  
                  G.playing_card = (G.playing_card and G.playing_card + 1) or 1
                  base_card.playing_card = G.playing_card
                  table.insert(G.playing_cards, base_card)
                  
                  G.E_MANAGER:add_event(Event({
                      func = function() 
                          G.hand:emplace(base_card)
                          base_card:start_materialize()
                          return true
                      end
                  }))
                  __PRE_RETURN_CODE_END__`,
        message: customMessage ? `"${customMessage}"` : '"Added Card to Hand!"',
        colour: "G.C.GREEN",
      };
    } else {
      return {
        statement: `func = function()
                  ${cardSelectionCode}
                  local base_card = create_playing_card({
                      front = card_front,
                      center = ${centerParam}
                  }, G.discard, true, false, nil, true)
                  ${sealCode.replace(/new_card/g, "base_card")}
                  ${editionCode.replace(/new_card/g, "base_card")}
                  
                  G.playing_card = (G.playing_card and G.playing_card + 1) or 1
                  base_card.playing_card = G.playing_card
                  table.insert(G.playing_cards, base_card)
                  
                  G.E_MANAGER:add_event(Event({
                      func = function()
                          G.hand:emplace(base_card)
                          base_card:start_materialize()
                          SMODS.calculate_context({ playing_card_added = true, cards = { base_card } })
                          return true
                      end
                  }))
              end`,
        message: customMessage ? `"${customMessage}"` : '"Added Card to Hand!"',
        colour: "G.C.GREEN",
      };
    }
  }
  return {
    statement: '',
    colour: "G.C.GREEN"
  }
}