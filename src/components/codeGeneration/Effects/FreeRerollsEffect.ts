import { JokerData } from "../../data/BalatroUtils";
import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn, PassiveEffectResult } from "../lib/effectUtils";
import { generateConfigVariables, generateValueCode } from "../lib/gameVariableUtils";

export const generateFreeRerollsPassiveEffectCode = (
  effect: Effect,
  joker?: JokerData,
): PassiveEffectResult => {
  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
    "reroll_amount",
    1,
    'joker',
    joker
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
): EffectReturn => {
  switch(itemType) {
    case "voucher":
      return generateVoucherCode(effect)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateVoucherCode = (
  effect: Effect,
): EffectReturn => {
  const valueCode = generateValueCode(effect.params?.value, 'voucher')  

  const FreeRerollsCode = `SMODS.change_free_rerolls(${valueCode})`

  return {
    statement: FreeRerollsCode,
    colour: "G.C.DARK_EDITION",
  };
};