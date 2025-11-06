import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../../Libs/effectUtils";

export const generateChangeTextVariableEffectCode = (
  effect: Effect,
): EffectReturn => {
  const variableName = (effect.params?.variable_name as string) || "textvar";
  const changeType = (effect.params?.change_type as string) || "random";
  const customText = (effect.params?.text as string) || "";
  const keyVar = (effect.params?.key_variable as string) || "keyvar"

  let statement = `__PRE_RETURN_CODE__`

  
  if (changeType === "custom_text") {
    statement += `
      card.ability.extra.${variableName} = '${customText}'`
  } else if (changeType === "key_var") {
    statement += `
      local all_key_lists = {}
      for _, pool in pairs(G.P_CENTER_POOLS) do
          for _, item in pairs(pool) do
              table.insert(all_key_lists, item)
          end      
      end
      for _, current_card in pairs(all_key_lists) do
          if current_card.key == card.ability.extra.${keyVar} then
            if current_card.set == "Seal" then
              card.ability.extra.${variableName} = current_card.key
            else 
              card.ability.extra.${variableName} = current_card.name
            end
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