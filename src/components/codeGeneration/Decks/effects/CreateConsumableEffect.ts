import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";

export const generateCreateConsumableReturn = (
  effect: Effect,
): EffectReturn => {
  const set = (effect.params?.set as string) || "random";
  const specificCard = (effect.params?.specific_card as string) || "random";
  const isNegative = (effect.params?.is_negative as string) === 'y';
  const isSoulable = (effect.params?.soulable as string) === 'y';
  const countCode = String(effect.params?.count) || '1'
  const ignoreSlots = (effect.params?.ignore_slots as string) === 'y';


  let createCode = ``;
  let colour = "G.C.PURPLE";

  if (!isNegative && !ignoreSlots) {
    createCode += `
    for i = 1, math.min(${countCode}, G.consumeables.config.card_limit - #G.consumeables.cards) do`
  } else {
    createCode += `
    for i = 1, ${countCode} do`
  }
  
  createCode += `
            G.E_MANAGER:add_event(Event({
            func = function()`

  if (isNegative) {
    createCode += `
            if G.consumeables.config.card_limit > #G.consumeables.cards + G.GAME.consumeable_buffer then
              G.GAME.consumeable_buffer = G.GAME.consumeable_buffer + 1
            end
`}

  createCode +=`
  
            play_sound('timpani')`
                 
  if (set === "random") {
    createCode += `
            local sets = {'Tarot', 'Planet', 'Spectral'}
            local random_set = pseudorandom_element(sets, 'random_consumable_set')`
  }

  createCode += `
            SMODS.add_card({ `

  if (set == "random") {
    createCode += `set = random_set, `
  } else  {
    createCode += `set = '${set}', `
  }

  if (isNegative) {
    createCode += `edition = 'e_negative', `
  }

  if (isSoulable && specificCard == "random") {
    createCode += `soulable = true, `
  }
  
  if (set !== "random" && specificCard !== "random") {
    createCode += `key = '${specificCard}'`
  }

    createCode +=`
             })
            return true
        end
        }))
    end
`

  return {
      statement: `__PRE_RETURN_CODE__
                   ${createCode}
                    __PRE_RETURN_CODE_END__`,
      colour: colour,

  }
};