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
  
  createCode += `
            G.E_MANAGER:add_event(Event({
            func = function()`

if (!isNegative && !ignoreSlots) {
    createCode += `
            for i = 1, math.min(${countCode}, G.consumeables.config.card_limit - #G.consumeables.cards) do`
  } else {
    createCode += `
            for i = 1, ${countCode} do`
  }

  if (isNegative) {
    createCode += `
            if G.consumeables.config.card_limit > #G.consumeables.cards + G.GAME.consumeable_buffer then
              G.GAME.consumeable_buffer = G.GAME.consumeable_buffer + 1
            end
`}

  createCode +=`
  
            play_sound('timpani')`

  createCode += `
            SMODS.add_card({ `

   if (set == "random") {
    createCode += `set = 'Consumeables', area = G.consumeables,`
  } else  {
    createCode += `set = '${set}', area = G.consumeables, `
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
        end
        return true
        end
        }))
`

  return {
      statement: `__PRE_RETURN_CODE__
                   ${createCode}
                    __PRE_RETURN_CODE_END__`,
      colour: colour,

  }
};