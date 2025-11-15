import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditShopCardsSlotsReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value || 1;
  const customMessage = effect.customMessage;

  const valueCode = generateGameVariableCode(value);

  let voucherSlotsCode = "";

    switch (operation) {
    case "add": {
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Shop Slot"`;
        voucherSlotsCode += `
         __PRE_RETURN_CODE__
         G.E_MANAGER:add_event(Event({
            trigger = 'after',
            delay = 0.4,
            func = function()
            card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.BLUE})
        change_shop_size(${valueCode})
                return true
            end
        }))
        __PRE_RETURN_CODE_END__`;
  break;
    }
    case "subtract": {
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." Shop Slot"`;
        voucherSlotsCode += `
         __PRE_RETURN_CODE__
         G.E_MANAGER:add_event(Event({
         trigger = 'after',
            delay = 0.4,
            func = function()
            card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
        change_shop_size(-${valueCode})
                return true
            end
        }))
        __PRE_RETURN_CODE_END__`;
  break;
    }
    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Shop Slot "..tostring(${valueCode})`;
        voucherSlotsCode += `
         __PRE_RETURN_CODE__
         G.E_MANAGER:add_event(Event({
         trigger = 'after',
            delay = 0.4,
            func = function()
          local current_shop_size = G.GAME.modifiers.shop_size
                    local target_shop_size = ${valueCode}
                    local difference = target_shop_size - current_shop_size
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
                    change_shop_size(difference)
                return true
            end
        }))
        __PRE_RETURN_CODE_END__`;
  }
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
