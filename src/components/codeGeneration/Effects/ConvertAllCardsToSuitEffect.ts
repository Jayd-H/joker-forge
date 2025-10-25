import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateConvertAllCardsToSuitEffectCode = (
  effect: Effect,
  itemType: string,
): EffectReturn => {
  switch(itemType) {
    case "consumable":
      return generateConsumableCode(effect)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateConsumableCode = (
  effect: Effect,
): EffectReturn => {
  const suit = effect.params?.suit || "Hearts";
  const customMessage = effect.customMessage;
  const suitPoolActive = (effect.params.suit_pool as Array<boolean>) || [];
  const suitPoolSuits = ["'Spades'","'Hearts'","'Diamonds'","'Clubs'"]

    let suitCode = "";

    suitCode += `
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
            for i = 1, #G.hand.cards do
                local percent = 1.15 - (i - 0.999) / (#G.hand.cards - 0.998) * 0.3
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.15,
                    func = function()
                        G.hand.cards[i]:flip()
                        play_sound('card1', percent)
                        G.hand.cards[i]:juice_up(0.3, 0.3)
                        return true
                    end
                }))
            end`

    if (suit === "random") {
        suitCode += `
            local _suit = pseudorandom_element(SMODS.Suits, 'convert_all_suit').key`
    } else if (suit === "pool"){
        const suit_pool = []
        for (let i = 0; i < suitPoolActive.length; i++){
        if (suitPoolActive[i] == true){
            suit_pool.push(suitPoolSuits[i])
        }}
        suitCode += `
            local suit_pool = {${suit_pool}}
            local _suit = pseudorandom_element(suit_pool, 'convert_all_suit')`
    } else {
        suitCode += `
            local _suit = ${suit}`
    }

    suitCode += `
            for i = 1, #G.hand.cards do
                G.E_MANAGER:add_event(Event({
                    func = function()
                        local _card = G.hand.cards[i]
                        assert(SMODS.change_base(_card, nil, _suit))
                        return true
                    end
                }))
            end
            for i = 1, #G.hand.cards do
                local percent = 0.85 + (i - 0.999) / (#G.hand.cards - 0.998) * 0.3
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.15,
                    func = function()
                        G.hand.cards[i]:flip()
                        play_sound('tarot2', percent, 0.6)
                        G.hand.cards[i]:juice_up(0.3, 0.3)
                        return true
                    end
                }))
            end
            delay(0.5)
            __PRE_RETURN_CODE_END__`;

  const result: EffectReturn = {
    statement: suitCode,
    colour: "G.C.SECONDARY_SET.Tarot",
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
}