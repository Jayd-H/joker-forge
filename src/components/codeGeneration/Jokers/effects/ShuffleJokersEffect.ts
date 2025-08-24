import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";

export const generateShuffleJokerReturn = (
  effect: Effect,
): EffectReturn => {
  const customMessage = effect.customMessage;

  const jokerShuffleCode = `if #G.jokers.cards > 1 then
  G.jokers:unhighlight_all()
  G.E_MANAGER:add_event(Event({
      trigger = 'before',
      func = function()
          G.E_MANAGER:add_event(Event({
              func = function()
                  G.jokers:shuffle('aajk')
                  play_sound('cardSlide1', 0.85)
                  return true
              end,
          }))
          delay(0.15)
          G.E_MANAGER:add_event(Event({
              func = function()
                  G.jokers:shuffle('aajk')
                  play_sound('cardSlide1', 1.15)
                  return true
              end
          }))
          delay(0.15)
          G.E_MANAGER:add_event(Event({
              func = function()
                  G.jokers:shuffle('aajk')
                  play_sound('cardSlide1', 1)
                  return true
              end
          }))
        delay(0.5)
        return true
      end
    }))
  end`;

  return {
    statement: `__PRE_RETURN_CODE__${jokerShuffleCode}__PRE_RETURN_CODE_END__`,
    message: customMessage ?? `"Shuffle!"`,
    colour: "G.C.ORANGE"
  }
};
