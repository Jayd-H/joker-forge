import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateDestroySelectedCardsReturn = (
  effect: Effect
): EffectReturn => {
  const customMessage = effect.customMessage;

      const destroyCode = `
                __PRE_RETURN_CODE__
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.4,
                    func = function()
                        play_sound('tarot1')
                        used_card:juice_up(0.3, 0.5)
                        return true
                    end
                }))
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.2,
                    func = function()
                        SMODS.destroy_cards(G.hand.highlighted)
                        return true
                    end
                }))
                delay(0.3)
                __PRE_RETURN_CODE_END__`;

      const result: EffectReturn = {
        statement: destroyCode,
        colour: "G.C.RED",
      };

      if (customMessage) {
        result.message = `"${customMessage}"`;
      }

      return result;
};
