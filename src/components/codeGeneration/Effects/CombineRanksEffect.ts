import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn, PassiveEffectResult } from "../effectUtils";
import type { ConsumableData, DeckData, EditionData, EnhancementData, JokerData, SealData, VoucherData } from "../../data/BalatroUtils";
import {
  generateConfigVariables,
} from "../gameVariableUtils";
import { generateGameVariableCode } from "../Consumables/gameVariableUtils";

export const generateCombineRanksPassiveEffectCode = (
  effect: Effect, 
  jokerKey: string,
): PassiveEffectResult => {
  const sourceRankType =
    (effect.params?.source_rank_type as string) || "specific";
  const sourceRanksString = (effect.params?.source_ranks as string) || "J,Q,K";
  const targetRank = (effect.params?.target_rank as string) || "J";
  const sourceRanks =
    sourceRankType === "specific"
      ? sourceRanksString.split(",").map((rank) => rank.trim())
      : [];

  return {
    addToDeck: `-- Combine ranks effect enabled`,
    removeFromDeck: `-- Combine ranks effect disabled`,
    configVariables: [
      `source_rank_type = "${sourceRankType}"`,
      ...(sourceRankType === "specific"
        ? [
            `source_ranks = {${sourceRanks
              .map((rank) => `"${rank}"`)
              .join(", ")}}`,
          ]
        : []),
      `target_rank = "${targetRank}"`,
    ],
    locVars: [],
    needsHook: {
      hookType: "combine_ranks",
      jokerKey: jokerKey || "PLACEHOLDER",
      effectParams: {
        sourceRankType,
        sourceRanks,
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