import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../../lib/effectUtils";

export const generateBalanceChipsAndMultEffectCode = (
  effect: Effect,
): EffectReturn => {
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
