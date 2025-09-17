import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";

export const generateDestroySelfReturn = (effect?: Effect): EffectReturn => {
  const thing = effect?.params.animation+'()'
  const isMessage = effect?.params.display_message
  const customMessage = effect?.customMessage;
  const statement = `func = function()
                card:${thing}
                return true
            end`;
  if (isMessage == 'y'){
  return {
    statement: statement,
    message: customMessage ? `"${customMessage}"` : `"Destroyed!"`,
    colour: "G.C.RED",
  }}
  else{
    return {
      statement:statement,
      colour:"G.C.RED"
  }}
};
