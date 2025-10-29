import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateDestroyCardEffectCode = (
  effect: Effect,
  itemType: string,
  triggerType: string,
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect, triggerType)

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