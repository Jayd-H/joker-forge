import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";
import { generateValueCode } from "../lib/gameVariableUtils";

export const generateShowMessageReturn = (effect: Effect, itemType: string): EffectReturn => {
  const colour = (effect.params?.colour?.value as string) || "G.C.WHITE";
  const silent = (effect.params?.silent?.value as string) || "true";
  
  const scaleCode = generateValueCode(effect.params?.scale, itemType);
  const holdCode = generateValueCode(effect.params?.hold, itemType);
  
  const customMessage = effect.customMessage;

  return {
    statement: `G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    attention_text({
                        text = "${customMessage}",
                        scale = ${scaleCode},
                        hold = ${holdCode},
                        major = card,
                        backdrop_colour = ${colour},
                        align = (G.STATE == G.STATES.TAROT_PACK or G.STATE == G.STATES.SPECTRAL_PACK or G.STATE == G.STATES.SMODS_BOOSTER_OPENED) and
                            'tm' or 'cm',
                        offset = { x = 0, y = (G.STATE == G.STATES.TAROT_PACK or G.STATE == G.STATES.SPECTRAL_PACK or G.STATE == G.STATES.SMODS_BOOSTER_OPENED) and -0.2 or 0 },
                        silent = ${silent},
                    })
                    G.E_MANAGER:add_event(Event({
                        trigger = 'after',
                        delay = 0.06 * G.SETTINGS.GAMESPEED,
                        blockable = false,
                        blocking = false,
                        func = function()
                            play_sound('tarot2', 0.76, 0.4)
                            return true
                        end
                    }))
                    play_sound('tarot2', 1, 0.4)
                    card:juice_up(0.3, 0.5)
                    return true
                end
            }))`,
    colour: "G.C.WHITE"
  };
};
