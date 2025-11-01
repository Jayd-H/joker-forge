import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { SUITS } from "../../data/BalatroUtils"

export const generateChangeSuitVariableEffectCode = (
  effect: Effect,
): EffectReturn => {
  const variableName = (effect.params.variable_name as string) || "suitvar";
  const changeType = (effect.params.change_type as string) || "random";
  const specificSuit = (effect.params.specific_suit as string) || "Spades";
  const suitPoolActive = (effect.params.suit_pool as Array<boolean>) || [];
  const suitPoolSuits = SUITS.map(suit => suit.value)
  

  let statement = "";

  if (changeType === "random") {
    statement = `__PRE_RETURN_CODE__
                if G.playing_cards then
                    local valid_${variableName}_cards = {}
                    for _, v in ipairs(G.playing_cards) do
                        if not SMODS.has_no_suit(v) then
                            valid_${variableName}_cards[#valid_${variableName}_cards + 1] = v
                        end
                    end
                    if valid_${variableName}_cards[1] then
                        local ${variableName}_card = pseudorandom_element(valid_${variableName}_cards, pseudoseed('${variableName}' .. G.GAME.round_resets.ante))
                        G.GAME.current_round.${variableName}_card.suit = ${variableName}_card.base.suit
                    end
                end
                __PRE_RETURN_CODE_END__`;
  } else if (changeType === "pool") {
    const suitPool = []
    for (let i = 0; i < suitPoolActive.length; i++){
      if (suitPoolActive[i] == true){
      suitPool.push(suitPoolSuits[i])
    }}
    statement = `__PRE_RETURN_CODE__
                local suit_pool = {${suitPool}}
                G.GAME.current_round.${variableName}_card.suit = pseudorandom_element(suit_pool, pseudoseed('randomSuit'))
                __PRE_RETURN_CODE_END__`;
  } else if (
    changeType === "scored_card" || changeType === "destroyed_card" || changeType === "added_card" || 
    changeType === "card_held_in_hand" || changeType === "discarded_card"
  ) {
    statement = `__PRE_RETURN_CODE__
                G.GAME.current_round.${variableName}_card.suit = context.other_card.base.suit
                __PRE_RETURN_CODE_END__`
  } else {
    statement = `__PRE_RETURN_CODE__
                G.GAME.current_round.${variableName}_card.suit = '${specificSuit}'
                __PRE_RETURN_CODE_END__`;
  }

  const result: EffectReturn = {
    statement,
    colour: "G.C.FILTER",
  };

  if (effect.customMessage) {
    result.message = `"${effect.customMessage}"`;
  }

  return result;
}