import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";

export const generateCreateConsumableReturn = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  const set = (effect.params?.set as string) || "random";
  const specificCard = (effect.params?.specific_card as string) || "random";
  const isNegative = (effect.params?.is_negative as string) == 'y';
  const customMessage = effect.customMessage;
  const isSoulable = effect.params?.soulable;
  const countCode = effect.params?.count_code
  const ignoreSlots = effect.params?.ignore_slots || false;

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  let createCode = "";
  let colour = "G.C.PURPLE";
  let localizeKey = "";

  // Determine the set and card to create
    if (!isNegative && !ignoreSlots){createCode += `
    for i = 1, math.min(${countCode}, G.consumeables.config.card_limit - #G.consumeables.cards) do`
  }else{createCode += `
    for i = 1, ${countCode} do`
  }
  
  createCode += `
            G.E_MANAGER:add_event(Event({
            trigger = 'after',
            delay = 0.4,
            func = function()`
  if (isNegative){createCode += `
            if G.consumeables.config.card_limit > #G.consumeables.cards + G.GAME.consumeable_buffer then
              G.GAME.consumeable_buffer = G.GAME.consumeable_buffer + 1
            end
`}

  createCode +=`
            play_sound('timpani')`
                 
  if (set === "random"){createCode += `
            local sets = {'Tarot', 'Planet', 'Spectral'}
            local random_set = pseudorandom_element(sets, 'random_consumable_set')`
  }

  createCode += `
            SMODS.add_card({ `

  if (set == "random"){createCode += `set = random_set, `}
  else if (specificCard == "random"){createCode += `set = ${set}, `}

  if (isNegative){createCode += `edition = 'e_negative', `}
  if (isSoulable && specificCard == "random"){createCode += `soulable = true, `}
  if (set !== "random" && specificCard !== "random"){createCode += `key = '${specificCard}'`}

  createCode += `})                            
            used_card:juice_up(0.3, 0.5)`

  if (isNegative){createCode += `
            end`}

    createCode +=`
            return true
        end
        }))
    end
    delay(0.6)
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

  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__${createCode}
                __PRE_RETURN_CODE_END__`,
      message: customMessage
        ? `"${customMessage}"`
        : `created_consumable and localize('${localizeKey}') or nil`,
      colour: colour,
    };
  } else {
    return {
      statement: `func = function()${createCode}
                    if created_consumable then
                        card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${
                          customMessage
                            ? `"${customMessage}"`
                            : `localize('${localizeKey}')`
                        }, colour = ${colour}})
                    end
                    return true
                end`,
      colour: colour,
    };
  }
};
