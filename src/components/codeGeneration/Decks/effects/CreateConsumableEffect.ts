import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";

export const generateCreateConsumableReturn = (
  effect: Effect,
): EffectReturn => {
  const set = (effect.params?.set as string) || "random";
  const specificCard = (effect.params?.specific_card as string) || "random";
  const isNegative = (effect.params?.is_negative as string) === 'y';
  const customMessage = effect.customMessage as string;
  const isSoulable = (effect.params?.soulable as string) === 'y';
  const countCode = String(effect.params?.count) || '1'
  const ignoreSlots = (effect.params?.ignore_slots as string) === 'y';


  let createCode = ``;
  let colour = "G.C.PURPLE";
  let localizeKey = "";

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

    localizeKey = "k_plus_consumable";


    // Determine color and localize key based on set
    if (set === "Tarot") {
      colour = "G.C.PURPLE";
      localizeKey = "k_plus_tarot";
    } else if (set === "Planet") {
      colour = "G.C.SECONDARY_SET.Planet";
      localizeKey = "k_plus_planet";
    } else if (set === "Spectral") {
      colour = "G.C.SECONDARY_SET.Spectral";
      localizeKey = "k_plus_spectral";
    } else {
      // Custom set
      colour = "G.C.PURPLE";
      localizeKey = "k_plus_consumable";
    }

  return {
      statement: `__PRE_RETURN_CODE__
                   ${createCode}
                      if created_consumable then
                        card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${
                          customMessage
                            ? `"${customMessage}"`
                            : `localize('${localizeKey}')`
                        }, colour = ${colour}})
                    end
                    return true
                    __PRE_RETURN_CODE_END__`,
      colour: colour,

  }
};