import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateDestroyRandomJokerReturn = (
  effect: Effect
): EffectReturn => {
  const type = effect.params?.type || "random";
  const amount = effect.params?.amount || 1;
  const amountCode = generateGameVariableCode(amount);
  const customMessage = effect.customMessage;

  const destroyJokerCode = `
            __PRE_RETURN_CODE__
            local jokers_to_destroy = {}
            local deletable_jokers = {}
            
            for _, joker in pairs(G.jokers.cards) do
                if joker.ability.set == 'Joker' and not SMODS.is_eternal(joker, card) then
                    deletable_jokers[#deletable_jokers + 1] = joker
                end
            end
            
            if #deletable_jokers > 0 then
                local temp_jokers = {}
                for _, joker in ipairs(deletable_jokers) do 
                    temp_jokers[#temp_jokers + 1] = joker 
                end
                
                pseudoshuffle(temp_jokers, 98765)
                
                for i = 1, math.min(${amountCode}, #temp_jokers) do
                    jokers_to_destroy[#jokers_to_destroy + 1] = temp_jokers[i]
                end
            end

            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    play_sound('tarot1')
                    used_card:juice_up(0.3, 0.5)
                    return true
                end
            }))

            local _first_dissolve = nil
            G.E_MANAGER:add_event(Event({
                trigger = 'before',
                delay = 0.75,
                func = function()
                    for _, joker in pairs(jokers_to_destroy) do
                        joker:start_dissolve(nil, _first_dissolve)
                        _first_dissolve = true
                    end
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;

  if (type === "selected") {
           `__PRE_RETURN_CODE__
    use = function(self, card)
        local self_card = G.jokers.highlighted[1]
        G.E_MANAGER:add_event(Event({trigger = 'after', delay = 0.4, func = function()
            play_sound('timpani')
            card:juice_up(0.3, 0.5)
            ease_dollars(card.ability.money, true)
            return true end }))
        self_card:start_dissolve()
        delay(0.6)
    end,`;
}
    
  const configVariables =
    typeof amount === "string" && amount.startsWith("GAMEVAR:")
      ? []
      : [`destroy_joker_amount = ${amount}`];
    
  const result: EffectReturn = {
    statement: destroyJokerCode,
    colour: "G.C.RED",
    configVariables,
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
