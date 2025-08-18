import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";

export const generateUnlockJokerReturn = (
  effect: Effect
): EffectReturn => {
  const jokerKey = (effect.params?.joker_key as string) || "";
  const discover = (effect.params?.discover as string) === "true" ? true : false
  const customMessage = effect.customMessage;

  const normalizedJokerKey = jokerKey.startsWith("j_") 
  ? jokerKey 
  : `j_${jokerKey}`

  return {
    statement: `func = function()
      local target_joker = G.P_CENTERS["${normalizedJokerKey}"]
      if target_joker then
        unlock_card(target_joker)
        ${discover ? "discover_card(target_joker)" : ""}
        ${customMessage ? `SMODS.calculate_effect({message = "${customMessage}"}, card)` : ""}
      else
        error("JOKERFORGE: Invalid joker key in Unlock Joker Effect. Did you forget the modprefix or misspelled the key?")
      end
      return true
    end`,
    colour: "G.C.BLUE"
  }
};
