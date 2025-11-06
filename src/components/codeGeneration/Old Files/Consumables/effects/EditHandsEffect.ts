import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditHandsReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const duration = effect.params?.duration || "permanent";
  const value = effect.params?.value;
  const customMessage = effect.customMessage;

  const valueCode = generateGameVariableCode(value);

  let handsCode = "";
  let editHandCode = "";

  switch (operation) {
    case "add": {
      if (duration === "permanent") {
        editHandCode = `
        G.GAME.round_resets.hands = G.GAME.round_resets.hands + ${valueCode}
        ease_hands_played(${valueCode})
        `;
      } else if (duration === "round") {
        editHandCode = `G.GAME.current_round.hands_left = G.GAME.current_round.hands_left + ${valueCode}`;
      }
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Hand"`;
      handsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.GREEN})
                    ${editHandCode}
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    case "subtract": {
      if (duration === "permanent") {
        editHandCode = `
        G.GAME.round_resets.hands = G.GAME.round_resets.hands - ${valueCode}
        ease_hands_played(-${valueCode})
        `;
      } else if (duration === "round") {
        editHandCode = `G.GAME.current_round.hands_left = G.GAME.current_round.hands_left - ${valueCode}`;
      }
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." Hand"`;
      handsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
                    ${editHandCode}
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    case "set": {
      if (duration === "permanent") {
        editHandCode = `
        G.GAME.round_resets.hands = ${valueCode}
        ease_hands_played(${valueCode} - G.GAME.current_round.hands_left)
        `;
      } else if (duration === "round") {
        editHandCode = `G.GAME.current_round.hands_left = ${valueCode}`;
      }
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Set to "..tostring(${valueCode}).." Hands"`;
      handsCode = `
            __PRE_RETURN_CODE__
            local mod = ${valueCode} - G.GAME.round_resets.hands
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
                    ${editHandCode}
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
  }

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`hands_value = ${value}`];

  return {
    statement: handsCode,
    colour: "G.C.GREEN",
    configVariables,
  };
};
