import { Effect } from "../../ruleBuilder";
import { EffectReturn } from "../Libs/effectUtils";

export const generateCrashGameEffectCode = (
  effect: Effect,
): EffectReturn => {

  const customMessage = (effect.customMessage ?? "EasternFarmer Was Here")
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")

  return {
    colour: "G.C.BLUE",
    statement: `__PRE_RETURN_CODE__error("${customMessage}")
    __PRE_RETURN_CODE_END__`
  }
}