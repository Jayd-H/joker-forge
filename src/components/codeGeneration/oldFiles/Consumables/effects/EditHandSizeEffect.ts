import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditHandSizeReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value;
  const customMessage = effect.customMessage;

  const valueCode = generateGameVariableCode(value);

  let handSizeCode = "";

  switch (operation) {
    case "add": {
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Hand Size"`;
      handSizeCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.BLUE})
                    G.hand:change_size(${valueCode})
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    case "subtract": {
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." Hand Size"`;
      handSizeCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
                    G.hand:change_size(-${valueCode})
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Hand Size set to "..tostring(${valueCode})`;
      handSizeCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    local current_hand_size = G.hand.config.card_limit
                    local target_hand_size = ${valueCode}
                    local difference = target_hand_size - current_hand_size
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
                    G.hand:change_size(difference)
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    default: {
      const defaultMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Hand Size"`;
      handSizeCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${defaultMessage}, colour = G.C.BLUE})
                    G.hand:change_size(${valueCode})
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
    }
  }

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`hand_size_value = ${value}`];

  return {
    statement: handSizeCode,
    colour: "G.C.BLUE",
    configVariables,
  };
};
