import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";

export const generateBalanceReturn = (effect: Effect): EffectReturn => {
  const customMessage = effect.customMessage;

  const result: EffectReturn = {
    statement: `balance = true`,
    colour: "G.C.PURPLE",
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
