import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";

export const generateUnlockJokerEffectCode = (
  effect: Effect,
): EffectReturn => {
  const selectionMethod = (effect.params?.selection_method as string) || "key"
  const jokerKey = (effect.params?.joker_key as string) || "j_joker";
  const discover = (effect.params?.discover as string) === "true" ? true : false
  const customMessage = effect.customMessage;
  const keyVariable = (effect.params?.key_variable as string) || "none";

  const normalizedJokerKey = jokerKey.startsWith("j_") 
  ? jokerKey 
  : `j_${jokerKey}`

  let statement = ''

  if (selectionMethod === "key") {
    statement = `func = function()
      local target_joker = G.P_CENTERS["${normalizedJokerKey}"]
      if target_joker then
        unlock_card(target_joker)
        ${discover ? "discover_card(target_joker)" : ""}
        ${customMessage ? `SMODS.calculate_effect({message = "${customMessage}"}, card)` : ""}
      else
        error("JOKERFORGE: Invalid joker key in Unlock Joker Effect. Did you forget the modprefix or misspelled the key?")
      end
      return true
    end`
  } else {
    statement = `func = function()
      local target_joker = G.P_CENTERS[card.ability.extra.${keyVariable}]
      if target_joker then
        unlock_card(target_joker)
        ${discover ? "discover_card(target_joker)" : ""}
        ${customMessage ? `SMODS.calculate_effect({message = "${customMessage}"}, card)` : ""}
      else
        error("JOKERFORGE: Invalid joker key in Unlock Joker Effect. Did you forget the modprefix or misspelled the key?")
      end
      return true
    end`
  }
  return {
    statement: statement,
    colour: "G.C.BLUE"
  }
}