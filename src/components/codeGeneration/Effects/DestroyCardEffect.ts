import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../Libs/effectUtils";

export const generateDestroyCardEffectCode = (
  effect: Effect,
  itemType: string,
  triggerType: string,
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect, triggerType)
    case "card":
      return generateCardCode(effect, triggerType)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

interface ExtendedEffect extends Effect {
  _isInRandomGroup?: boolean;
  _ruleContext?: string;
  _effectIndex?: number;
}

const generateJokerCode = (
  effect: ExtendedEffect,
  triggerType: string,
): EffectReturn => {
  const customMessage = effect?.customMessage;
  const isInRandomGroup = effect?._isInRandomGroup;

  if (triggerType === "card_discarded") {
    return {
      statement: `remove = true,
                  message = ${
                    customMessage ? `"${customMessage}"` : `"Destroyed!"`
                  }`,
      message: "",
      colour: "",
    };
  }

  // If this delete effect is inside a random group, only return the message
  // The destroy flag will be handled by the random group logic
  if (isInRandomGroup) {
    return {
      statement: "",
      message: customMessage ? `"${customMessage}"` : `"Destroyed!"`,
      colour: "G.C.RED",
    };
  }

  return {
    statement: "",
    message: customMessage ? `"${customMessage}"` : `"Destroyed!"`,
    colour: "G.C.RED",
  };
}

const generateCardCode = (
  effect: Effect,
  triggerType: string,
): EffectReturn => {
  const customMessage = effect.customMessage;
  const setGlassTrigger = effect.params?.set_glass_trigger === "true";

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