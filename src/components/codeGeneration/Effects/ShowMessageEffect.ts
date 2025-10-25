import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import type { ConsumableData, EditionData, EnhancementData, JokerData, SealData } from "../../data/BalatroUtils";

export const generateShowMessageReturn = (
  effect: Effect,
  itemType: string,
  joker?: JokerData,
  consumable?: ConsumableData,
  card?: EnhancementData | EditionData | SealData,
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect, 0, joker)
    case "consumable":
      return generateConsumableCode(effect, consumable)
    case "card":
      return generateCardCode(effect, card)

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
  const colour = (effect.params?.colour as string) || "G.C.WHITE";
  const customMessage = effect.customMessage;

  const messageCode = customMessage ? `"${customMessage}"` : '"Message!"';

  return {
    statement: "",
    message: messageCode,
    colour: colour,
  };
};

const generateConsumableCode = (
  effect: Effect,
  consumable?: ConsumableData
): EffectReturn => {
  const colour = (effect.params?.colour as string) || "G.C.WHITE";
  const customMessage = effect.customMessage;

  const messageCode = customMessage ? `"${customMessage}"` : '"Message!"';

  return {
    statement: "",
    message: messageCode,
    colour: colour,
  };
}

const generateCardCode = (
  effect: Effect,
  card?: EditionData | EnhancementData | SealData
): EffectReturn => {
  const colour = (effect.params?.colour as string) || "G.C.WHITE";
  const customMessage = effect.customMessage;

  const messageCode = customMessage ? `"${customMessage}"` : '"Message!"';

  return {
    statement: "",
    message: messageCode,
    colour: colour,
  };
}