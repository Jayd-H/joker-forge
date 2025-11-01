import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../../effectUtils";

export const generateChangeTextVariableEffectCode = (
  effect: Effect,
): EffectReturn => {
  const variableName = (effect.params?.variable_name as string) || "textvar";
  const changeType = (effect.params?.change_type as string) || "random";
  const customText = (effect.params?.custom_text as string) || "";
  const jokerVar = (effect.params?.joker_var as string) || "jokervar"

  let statement = `__PRE_RETURN_CODE__`

  
  if (changeType === "custom_text") {
    statement += `
      card.ability.extra.${variableName} = ${customText}`
  } else if (changeType === "joker_var") {
    statement += `
      for i = 1, #G.jokers.cards do
          if G.jokers.cards[i].config.center.key == card.ability.extra.${jokerVar} then
              card.ability.extra.${variableName} = G.jokers.cards[i].config.center.name
              break
          end
      end`
  }

  statement += `
    __PRE_RETURN_CODE_END__`;   


  const result: EffectReturn = {
    statement,
    colour: "G.C.FILTER",
  };

  if (effect.customMessage) {
    result.message = `"${effect.customMessage}"`;
  }

  return result;
}