import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";

export const generateForceGameOverEffectCode = (
  effect: Effect,
): EffectReturn => {
  const customMessage = effect.customMessage;
  const message = customMessage ? `card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = "${customMessage}", colour = G.C.RED})`: ``;

  const statement = `func = function()
                ${message}
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.5,
                    func = function()
                        if G.STAGE == G.STAGES.RUN then 
                          G.STATE = G.STATES.GAME_OVER
                          G.STATE_COMPLETE = false
                        end
                    end
                }))
                
                return true
            end`;

  return {
    statement,
    colour: "G.C.GREEN",
  };
}