import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateSwapChipsMultReturn = (
  effect: Effect,
): EffectReturn => {

  const customMessage = effect.customMessage;

  const result: EffectReturn = {
    statement: `swap = true`,
    colour: "G.C.CHIPS",
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
