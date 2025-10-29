import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn, PassiveEffectResult } from "../effectUtils";
import type { ConsumableData, DeckData, EditionData, EnhancementData, JokerData, SealData, VoucherData } from "../../data/BalatroUtils";
import {
  generateConfigVariables,
} from "../gameVariableUtils";
import { generateGameVariableCode } from "../Consumables/gameVariableUtils";

export const generateFreeRerollsPassiveEffectCode = (
  effect: Effect,
): PassiveEffectResult => {
  const variableName = "reroll_amount";

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'joker'
  );

  return {
    addToDeck: `SMODS.change_free_rerolls(${valueCode})`,
    removeFromDeck: `SMODS.change_free_rerolls(-(${valueCode}))`,
    configVariables:
      configVariables.length > 0
        ? configVariables.map((cv) => cv.name + " = " + cv.value)
        : [],
    locVars: [],
  };
};

export const generateEffectCode = (
  effect: Effect,
  itemType: string,
  joker?: JokerData,
  consumable?: ConsumableData,
  card?: EnhancementData | EditionData | SealData,
  voucher?: VoucherData,
  deck?: DeckData,
): EffectReturn => {
  switch(itemType) {
    case "consumable":
      return generateConsumableCode(effect, consumable)
    case "card":
      return generateCardCode(effect, card)
    case "voucher":
      return generateVoucherCode(effect, voucher)
    case "deck":
      return generateDeckCode(effect, deck)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateConsumableCode = (
  effect: Effect,
  consumable?: ConsumableData
): EffectReturn => {
  const value = effect.params.value as string || "0";

  const valueCode = generateGameVariableCode(value);

const configVariables =
      typeof value === "string" && value.startsWith("GAMEVAR:")
        ? []
        : [`value = ${value}`];

return {
    statement: valueCode,
    colour: "G.C.WHITE",
   };
}

const generateCardCode = (
  effect: Effect,
  card?: EditionData | EnhancementData | SealData
): EffectReturn => {
  const value = effect.params.value as string || "0";

  const valueCode = generateGameVariableCode(value);

const configVariables =
      typeof value === "string" && value.startsWith("GAMEVAR:")
        ? []
        : [`value = ${value}`];

return {
    statement: valueCode,
    colour: "G.C.WHITE",
   };
}

const generateVoucherCode = (
  effect: Effect,
  voucher?: VoucherData
): EffectReturn => {
  const value = effect.params.value as string || "0";

  const valueCode = generateGameVariableCode(value);

const configVariables =
      typeof value === "string" && value.startsWith("GAMEVAR:")
        ? []
        : [`value = ${value}`];

return {
    statement: valueCode,
    colour: "G.C.WHITE",
   };
}

const generateDeckCode = (
  effect: Effect,
  deck?: DeckData
): EffectReturn => {
  const value = effect.params.value as string || "0";

  const valueCode = generateGameVariableCode(value);

const configVariables =
      typeof value === "string" && value.startsWith("GAMEVAR:")
        ? []
        : [`value = ${value}`];

return {
    statement: valueCode,
    colour: "G.C.WHITE",
   };
}