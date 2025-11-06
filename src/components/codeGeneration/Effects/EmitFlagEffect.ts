import { Effect } from "../../ruleBuilder";
import { EffectReturn } from "../Libs/effectUtils";

export const generateEmitFlagEffectCode = (
  effect: Effect,
  modprefix: string
): EffectReturn => {
  const flagName = (effect.params?.flag_name as string) || "custom_flag";
  const change = (effect.params?.change as string) || "true";
  const customMessage = effect.customMessage;

  const safeFlagName = flagName.trim().replace(/[^a-zA-Z0-9_]/g, '_'); // replace non-alphanumeric charactes with underscore
  const changeCode = change === "invert" ? `not (G.GAME.pool_flags.${modprefix}_${safeFlagName} or false)` : change

  return {
    statement: `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    play_sound('timpani')
                    used_card:juice_up(0.3, 0.5)
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = "${customMessage ?? safeFlagName}", colour = G.C.BLUE})
                    G.GAME.pool_flags.${modprefix}_${safeFlagName} = ${changeCode}
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`,
    colour: "G.C.BLUE"
  }
};