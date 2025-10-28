import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateDestroySelfEffectCode = (
  effect: Effect,
  itemType: string,
  triggerType: string,
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect)
    case "card":
      return generateCardCode(effect, triggerType)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateJokerCode = (
  effect: Effect,
): EffectReturn => {
  const thing = effect?.params.animation+'()'
  const isMessage = effect?.params.display_message
  const customMessage = effect?.customMessage;
  const statement = `func = function()
                card:${thing}
                return true
            end`;

  if (isMessage == 'y') {
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

const generateCardCode = (
  effect: Effect,
  triggerType: string,
): EffectReturn => {
  const customMessage = effect.customMessage;
  const setGlassTrigger = effect.params?.setGlassTrigger === "true";

  if (triggerType === "card_discarded") {
    const result: EffectReturn = {
      statement: `remove = true`,
      colour: "G.C.RED",
      configVariables: undefined,
    };

    if (customMessage) {
      result.message = `"${customMessage}"`;
    }

    return result;
  }

  let statement: string;

  if (setGlassTrigger) {
    statement = `__PRE_RETURN_CODE__card.glass_trigger = true
            card.should_destroy = true__PRE_RETURN_CODE_END__`;
  } else {
    statement = `__PRE_RETURN_CODE__card.should_destroy = true__PRE_RETURN_CODE_END__`;
  }

  const result: EffectReturn = {
    statement: statement,
    colour: "G.C.RED",
    configVariables: undefined,
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
}