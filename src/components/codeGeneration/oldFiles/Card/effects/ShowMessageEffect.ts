import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateShowMessageReturn = (effect: Effect): EffectReturn => {
  const colour = (effect.params?.colour as string) || "G.C.WHITE";
  const customMessage = effect.customMessage;

  const messageCode = customMessage ? `"${customMessage}"` : '"Message!"';

  return {
    statement: "",
    message: messageCode,
    colour: colour,
  };
};
