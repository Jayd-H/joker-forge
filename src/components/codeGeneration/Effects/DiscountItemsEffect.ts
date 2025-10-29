import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn, PassiveEffectResult } from "../effectUtils";
import type { ConsumableData, DeckData, EditionData, EnhancementData, JokerData, SealData, VoucherData } from "../../data/BalatroUtils";
import {
  generateConfigVariables,
} from "../gameVariableUtils";
import { generateGameVariableCode } from "../Consumables/gameVariableUtils";

export const generateDiscountItemsPassiveEffectCode = (
  effect: Effect,
  jokerKey: string
): PassiveEffectResult => {
  const discountType = (effect.params?.discount_type as string) || "planet";
  const discountMethod =
    (effect.params?.discount_method as string) || "make_free";

  const variableName = "discount_amount";

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.discount_amount,
    effect.id,
    variableName,
    "hook"
  );

  return {
    addToDeck: `G.E_MANAGER:add_event(Event({
    func = function()
        for k, v in pairs(G.I.CARD) do
            if v.set_cost then v:set_cost() end
        end
        return true
    end
}))`,
    removeFromDeck: `G.E_MANAGER:add_event(Event({
    func = function()
        for k, v in pairs(G.I.CARD) do
            if v.set_cost then v:set_cost() end
        end
        return true
    end
}))`,
    configVariables:
      configVariables.length > 0
        ? configVariables.map((cv) => cv.name + " = " + cv.value)
        : [],
    locVars: [],
    needsHook: {
      hookType: "discount_items",
      jokerKey: jokerKey || "PLACEHOLDER",
      effectParams: {
        discountType,
        discountMethod,
        discountAmount: valueCode,
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