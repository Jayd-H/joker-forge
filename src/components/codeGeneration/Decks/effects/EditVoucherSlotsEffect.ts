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
        G.GAME.starting_params.vouchers_in_shop = G.GAME.starting_params.vouchers_in_shop + ${valueCode}
        `;
  } else if (operation === "subtract") {
        voucherSlotsCode += `
        G.GAME.starting_params.vouchers_in_shop = G.GAME.starting_params.vouchers_in_shop - ${valueCode}
        `;
  } else if (operation === "set") {
        voucherSlotsCode += `
        G.GAME.starting_params.vouchers_in_shop = ${valueCode}
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
