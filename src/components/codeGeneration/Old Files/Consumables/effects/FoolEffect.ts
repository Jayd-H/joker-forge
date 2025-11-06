import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateFoolEffectReturn = (effect: Effect): EffectReturn => {
  const customMessage = effect.customMessage;

  const foolEffectCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    if G.consumeables.config.card_limit > #G.consumeables.cards then
                        play_sound('timpani')
                        SMODS.add_card({ key = G.GAME.last_tarot_planet })
                        used_card:juice_up(0.3, 0.5)
                    end
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;

  const result: EffectReturn = {
    statement: foolEffectCode,
    colour: "G.C.SECONDARY_SET.Tarot",
    customCanUse:
      "G.consumeables.config.card_limit > #G.consumeables.cards and G.GAME.last_tarot_planet and G.GAME.last_tarot_planet ~= card.config.center.key",
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
