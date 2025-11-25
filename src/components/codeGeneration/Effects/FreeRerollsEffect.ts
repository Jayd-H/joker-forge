import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn, PassiveEffectResult } from "../lib/effectUtils";
import { generateConfigVariables } from "../lib/gameVariableUtils";

export const generateFreeRerollsPassiveEffectCode = (
  effect: Effect,
): PassiveEffectResult => {
  const variableName = "reroll_amount";

  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
    variableName,
    'joker'
  );

  return {
    addToDeck: `SMODS.change_free_rerolls(${valueCode})`,
    removeFromDeck: `SMODS.change_free_rerolls(-(${valueCode}))`,
    configVariables,
    locVars: [],
  };
};

export const generateFreeRerollsEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0
): EffectReturn => {
  switch(itemType) {
    case "voucher":
      return generateVoucherCode(effect, sameTypeCount)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateVoucherCode = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const variableName =
    sameTypeCount === 0 ? "rerolls_value" : `rerolls_value${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
    variableName,
    'voucher;'
  );

  const FreeRerollsCode = `SMODS.change_free_rerolls(${valueCode})`

  return {
    statement: FreeRerollsCode,
    colour: "G.C.DARK_EDITION",
    configVariables
  };
};