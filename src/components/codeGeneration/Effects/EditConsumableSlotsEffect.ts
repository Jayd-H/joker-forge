import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn, PassiveEffectResult } from "../effectUtils";
import type { ConsumableData, DeckData, EditionData, EnhancementData, JokerData, SealData, VoucherData } from "../../data/BalatroUtils";
import {
  generateConfigVariables,
} from "../gameVariableUtils";
import { generateGameVariableCode } from "../Consumables/gameVariableUtils";

export const generateEditConsumableSlotsPassiveEffectCode = (
  effect: Effect
): PassiveEffectResult => {
  const operation = effect.params?.operation || "add";

  const { valueCode, configVariables, isXVariable } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    "slot_change",
    'joker'
  )

  let addToDeck = "";
  let removeFromDeck = "";

  switch (operation) {
    case "add":
      addToDeck = `G.E_MANAGER:add_event(Event({func = function()
            G.consumeables.config.card_limit = G.consumeables.config.card_limit + ${valueCode}
            return true
        end }))`;
      removeFromDeck = `G.E_MANAGER:add_event(Event({func = function()
            G.consumeables.config.card_limit = G.consumeables.config.card_limit - ${valueCode}
            return true
        end }))`;
      break;
    case "subtract":
      addToDeck = `G.E_MANAGER:add_event(Event({func = function()
            G.consumeables.config.card_limit = math.max(0, G.consumeables.config.card_limit - ${valueCode})
            return true
        end }))`;
      removeFromDeck = `G.E_MANAGER:add_event(Event({func = function()
            G.consumeables.config.card_limit = G.consumeables.config.card_limit + ${valueCode}
            return true
        end }))`;
      break;
    case "set":
      addToDeck = `original_slots = G.consumeables.config.card_limit
        G.E_MANAGER:add_event(Event({func = function()
            G.consumeables.config.card_limit = ${valueCode}
            return true
        end }))`;
      removeFromDeck = `if original_slots then
            G.E_MANAGER:add_event(Event({func = function()
                G.consumeables.config.card_limit = original_slots
                return true
            end }))
        end`;
      break;
    default:
      addToDeck = `G.E_MANAGER:add_event(Event({func = function()
            G.consumeables.config.card_limit = G.consumeables.config.card_limit + ${valueCode}
            return true
        end }))`;
      removeFromDeck = `G.E_MANAGER:add_event(Event({func = function()
            G.consumeables.config.card_limit = G.consumeables.config.card_limit - ${valueCode}
            return true
        end }))`;
  }

  return {
    addToDeck,
    removeFromDeck,
    configVariables: 
      configVariables.length > 0 ?
      configVariables.map((cv)=> `${cv.name} = ${cv.value}`)
      : [],
    locVars:
      isXVariable.isGameVariable || isXVariable.isRangeVariable ? [] : [valueCode],
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