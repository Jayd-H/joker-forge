import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateChangeJokerVariableReturn = (
  effect: Effect
): EffectReturn => {
  const variableName = (effect.params.variable_name as string) || "jokervar";
  const changeType = (effect.params.change_type as string) || "random";
  const specificJoker = (effect.params.specific_joker as string) || "j_joker";
  

  let statement = `__PRE_RETURN_CODE__`
  let valueCode = "j_joker"

  if (changeType === "evaled_joker") {
    valueCode = "context.other_joker.config.center.key"
  } else if (changeType === "specific") {
    valueCode = specificJoker
  } else if (changeType === "random") {
    valueCode = "random_joker_result"
    statement += `` // Add random joker evaluation
  } else {
    valueCode = changeType
  }

  statement += `
                card.ability.extra.${variableName} = ${valueCode}
                __PRE_RETURN_CODE_END__`;   


  const result: EffectReturn = {
    statement,
    colour: "G.C.FILTER",
  };

  if (effect.customMessage) {
    result.message = `"${effect.customMessage}"`;
  }

  return result;
};
