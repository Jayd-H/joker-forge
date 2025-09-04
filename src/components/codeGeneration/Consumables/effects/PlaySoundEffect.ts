import { Effect } from "../../../ruleBuilder";
import { EffectReturn } from "../effectUtils";

export const generatePlaySoundReturn = (
  effect: Effect,
  modprefix: string
): EffectReturn => {
  const key = effect.params.sound_key as string || "";

  const normalizedKey = key.startsWith(modprefix+"_")
    ? key
    : `${modprefix}_${key}`

  return {
    colour: "G.C.BLUE",
    statement: `__PRE_RETURN_CODE__play_sound("${normalizedKey}")
    __PRE_RETURN_CODE_END__`
  }
}