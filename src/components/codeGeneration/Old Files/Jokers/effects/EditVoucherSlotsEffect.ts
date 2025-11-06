import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import type { PassiveEffectResult } from "../effectUtils";
import {
  generateConfigVariables,
  generateGameVariableCode,
  parseGameVariable,
  parseRangeVariable,
} from "../gameVariableUtils";

export const generateEditVoucherSlotsReturn = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = effect.params?.operation || "add";

  const variableName =
    sameTypeCount === 0 ? "voucher_slots" : `voucher_slots${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName
  )

  const customMessage = effect.customMessage;
  let statement = "";

  switch (operation) {
    case "add": {
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Voucher Slots"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.DARK_EDITION})
                SMODS.change_voucher_limit(${valueCode})
                return true
            end`;
      break;
    }
    case "subtract": {
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." Voucher Slots"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
                SMODS.change_voucher_limit(-${valueCode})
                return true
            end`;
      break;
    }
    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Voucher Slots set to "..tostring(${valueCode})`;
      statement = `func = function()
                local current_voucher_slots = G.GAME.modifiers.extra_vouchers or 0
                local target_voucher_slots = ${valueCode}
                local difference = target_voucher_slots - current_voucher_slots
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
                SMODS.change_voucher_limit(difference)
                return true
            end`;
      break;
    }
    default: {
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Voucher Slots"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.DARK_EDITION})
                SMODS.change_voucher_limit(${valueCode})
                return true
            end`;
      break;
    }
  }

  return {
    statement,
    colour: "G.C.ORANGE",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };
};

export const generatePassiveVoucherSlots = (
  effect: Effect
): PassiveEffectResult => {
  const operation = effect.params?.operation || "add";
  const effectValue = effect.params.value;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let valueCode: string;

  if (parsed.isGameVariable) { /// change to generateConfigVariables maybe, i dunno, i dont see it necessary
    valueCode = generateGameVariableCode(effectValue as string);
  } else if (rangeParsed.isRangeVariable) {
    const seedName = `voucherslots_passive`;
    valueCode = `pseudorandom('${seedName}', ${rangeParsed.min}, ${rangeParsed.max})`;
  } else if (typeof effectValue === "string") {
    valueCode = `card.ability.extra.${effectValue}`;
  } else {
    valueCode = (effectValue as number | boolean).toString();
  }

  let addToDeck = "";
  let removeFromDeck = "";

  switch (operation) {
    case "add":
      addToDeck = `SMODS.change_voucher_limit(${valueCode})`;
      removeFromDeck = `SMODS.change_voucher_limit(-${valueCode})`;
      break;
    case "subtract":
      addToDeck = `SMODS.change_voucher_limit(-${valueCode})`;
      removeFromDeck = `SMODS.change_voucher_limit(${valueCode})`;
      break;
    case "set":
      addToDeck = `card.ability.extra.original_slot_size = G.GAME.modifiers.extra_vouchers or 0
        local difference = ${valueCode} - G.GAME.modifiers.extra_vouchers
        SMODS.change_discard_limit(difference)`;
      removeFromDeck = `if card.ability.extra.original_slot_size then
            local difference = card.ability.extra.original_slot_size - G.GAME.modifiers.extra_vouchers
            SMODS.change_discard_limit(difference)
        end`;
      break;
    default:
      addToDeck = `SMODS.change_voucher_limit(${valueCode})`;
      removeFromDeck = `SMODS.change_voucher_limit(-${valueCode})`;
  }

  return {
    addToDeck,
    removeFromDeck,
    configVariables: [],
    locVars: [],
  };
};
