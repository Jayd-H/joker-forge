import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";

export const generateEditGameSpeedEffectCode = (
  effect: Effect,
): EffectReturn => {
  const valueCode = effect.params?.speed as string || "0.5"
  const message = effect.customMessage

  return {
    statement: `__PRE_RETURN_CODE__
    G.SETTINGS.GAMESPEED = ${valueCode}
    __PRE_RETURN_CODE_END__`,
    colour: '',
    message,
  }
}