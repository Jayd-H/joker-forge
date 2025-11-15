import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditVoucherSlotsReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value || 1;

  const valueCode = generateGameVariableCode(value);

  let voucherSlotsCode = "";

    if (operation === "add") {
        voucherSlotsCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        SMODS.change_voucher_limit(${valueCode})
                return true
            end
        }))
        `;
  } else if (operation === "subtract") {
        voucherSlotsCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        SMODS.change_voucher_limit(-${valueCode})
                return true
            end
        }))
        `;
  } else if (operation === "set") {
        voucherSlotsCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
          local current_voucher_slots = G.GAME.modifiers.extra_vouchers
                    local target_voucher_slots = ${valueCode}
                    local difference = target_voucher_slots - current_voucher_slots
                    SMODS.change_voucher_limit(difference)
                return true
            end
        }))
        `;
  }

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`voucher_slots_value = ${value}`];

  return {
    statement: voucherSlotsCode,
    colour: "G.C.BLUE",
    configVariables,
  };
};
