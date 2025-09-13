import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateCreateConsumableReturn = (
  effect: Effect
): EffectReturn => {
  const set = effect.params?.set || "random";
  const specificCard = effect.params?.specific_card || "random";
  const isNegative = (effect.params?.is_negative as string) == 'y';
  const isSoulable = (effect.params?.soulable as string) == 'y';

  const count = effect.params?.count || 1;
  const customMessage = effect.customMessage;
  const ignoreSlots = effect.params?.ignore_slots || false;

  const countCode = generateGameVariableCode(count);

  let createCode = `
    __PRE_RETURN_CODE__`
  
  if (!isNegative && ignoreSlots){createCode += `
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
    __PRE_RETURN_CODE_END__`

  const configVariables =
    typeof count === "string" && count.startsWith("GAMEVAR:")
      ? []
      : [`
        consumable_count = ${count}`];

  const result: EffectReturn = {
    statement: createCode,
    colour: "G.C.SECONDARY_SET.Tarot",
    configVariables,
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
