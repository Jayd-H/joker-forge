import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../../lib/effectUtils";

export const generateBalanceChipsAndMultEffectCode = (
  effect: Effect,
  itemType: string,
): EffectReturn => {
  const customMessage = effect.customMessage;

  const result: EffectReturn = {
    statement: itemType === "joker" ? `balance = true` : `
    __PRE_RETURN_CODE__
    SMODS.calculate_effect({balance = true}, card)
    __PRE_RETURN_CODE_END__`,
    colour: "G.C.PURPLE",
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
