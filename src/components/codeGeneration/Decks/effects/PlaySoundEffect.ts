import { Effect } from "../../../ruleBuilder";
import { EffectReturn } from "../effectUtils";

export const generatePlaySoundReturn = (
  effect: Effect,
): EffectReturn => {
  const key = effect.params.sound_key as string || "";

  return {
    colour: "G.C.BLUE",
    statement: `__PRE_RETURN_CODE__
    G.E_MANAGER:add_event(Event({
     func = function()
    play_sound("${key}")
    return true
    end,
})) 
    __PRE_RETURN_CODE_END__`
  }
}