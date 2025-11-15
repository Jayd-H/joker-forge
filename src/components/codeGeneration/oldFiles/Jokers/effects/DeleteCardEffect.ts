import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";

interface ExtendedEffect extends Effect {
  _isInRandomGroup?: boolean;
  _ruleContext?: string;
  _effectIndex?: number;
}

export const generateDeleteCardReturn = (
  effect?: ExtendedEffect,
  triggerType?: string
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
};
