import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn, PassiveEffectResult } from "../effectUtils";
import type { ConsumableData, DeckData, EditionData, EnhancementData, JokerData, SealData, VoucherData } from "../../data/BalatroUtils";
import {
  generateConfigVariables,
} from "../gameVariableUtils";
import { generateGameVariableCode } from "../Consumables/gameVariableUtils";

export const generateReduceFlushStraightRequirementsPassiveEffectCode = (
  effect: Effect,
  jokerKey: string
): PassiveEffectResult => {
  const reductionValue = (effect.params?.reduction_value as number) || 1;

  return {
    addToDeck: `-- Flush/Straight requirements reduced by ${reductionValue}`,
    removeFromDeck: `-- Flush/Straight requirements restored`,
    configVariables: [`reduction_value = ${reductionValue}`],
    locVars: [`card.ability.extra.reduction_value`],
    needsHook: {
      hookType: "reduce_flush_straight_requirements",
      jokerKey: jokerKey || "PLACEHOLDER",
      effectParams: {
        reductionValue,
      },
    },
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
    case "joker":
      return generateJokerCode(effect, 0, joker)
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

const generateJokerCode = (
  effect: Effect,
  sameTypeCount: number = 0,
  joker?: JokerData
): EffectReturn => {
  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    `value${sameTypeCount + 1}`,
  );

  return {
    statement: valueCode,
    colour: "G.C.WHITE",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };
};

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