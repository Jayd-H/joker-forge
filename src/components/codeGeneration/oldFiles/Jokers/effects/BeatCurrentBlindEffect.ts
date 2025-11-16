import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";

export const generateBeatCurrentBlindReturn = (
  effect: Effect,
): EffectReturn => {
  const customMessage = effect.customMessage;
  const beatCode = `
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.5,
                func = function()
                    G.GAME.chips = G.GAME.blind.chips
                    G.STATE = G.STATES.HAND_PLAYED
                        G.STATE_COMPLETE = true
                        card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${
                            customMessage
                                ? `"${customMessage}"`
                                : `"Beaten"`
                            }, colour = G.C.RED})
                    return true
                end,
            }))
            `;
            
    return {
        statement: `func = function()${beatCode}
                    return true
                end`,
        colour: "G.C.GREEN",
    };
};