import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditJokerSlotsReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value;
  const customMessage = effect.customMessage;

  const valueCode = generateGameVariableCode(value);

  let jokerSlotsCode = "";

  switch (operation) {
    case "add": {
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Joker Slot"`;
      jokerSlotsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.DARK_EDITION})
                    G.jokers.config.card_limit = G.jokers.config.card_limit + ${valueCode}
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
        : `"-"..tostring(${valueCode}).." Joker Slot"`;
      jokerSlotsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
                    G.jokers.config.card_limit = math.max(1, G.jokers.config.card_limit - ${valueCode})
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
        : `"Joker Slots set to "..tostring(${valueCode})`;
      jokerSlotsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
                    G.jokers.config.card_limit = ${valueCode}
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
        : `"+"..tostring(${valueCode}).." Joker Slot"`;
      jokerSlotsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${defaultMessage}, colour = G.C.DARK_EDITION})
                    G.jokers.config.card_limit = G.jokers.config.card_limit + ${valueCode}
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
      : [`joker_slots_value = ${value}`];

  return {
    statement: jokerSlotsCode,
    colour: "G.C.DARK_EDITION",
    configVariables,
  };
};
