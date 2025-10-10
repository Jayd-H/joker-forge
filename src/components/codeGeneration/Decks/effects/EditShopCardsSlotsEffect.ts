import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditShopCardsSlotsReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value || 1;

  const valueCode = generateGameVariableCode(value);

  let voucherSlotsCode = "";

    if (operation === "add") {
        voucherSlotsCode += `
         G.E_MANAGER:add_event(Event({
            func = function()
        change_shop_size(${valueCode})
                return true
            end
        }))
        `;
  } else if (operation === "subtract") {
        voucherSlotsCode += `
         G.E_MANAGER:add_event(Event({
            func = function()
        change_shop_size(-${valueCode})
                return true
            end
        }))
        `;
  } else if (operation === "set") {
        voucherSlotsCode += `
         G.E_MANAGER:add_event(Event({
            func = function()
          local current_shop_size = G.GAME.modifiers.shop_size
                    local target_shop_size = ${valueCode}
                    local difference = target_shop_size - current_shop_size
                    change_shop_size(difference)
                return true
            end
        }))
        `;
  }

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`shop_size_value = ${value}`];

  return {
    statement: voucherSlotsCode,
    colour: "G.C.BLUE",
    configVariables,
  };
};
