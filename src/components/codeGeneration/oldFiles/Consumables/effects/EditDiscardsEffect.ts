import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditDiscardsReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const duration = effect.params?.duration || "permanent";
  const value = effect.params?.value;
  const customMessage = effect.customMessage;

  const valueCode = generateGameVariableCode(value);

  let discardsCode = "";
  let editDiscardCode = "";

  switch (operation) {
    case "add": {
      if (duration === "permanent") {
        editDiscardCode = `
        G.GAME.round_resets.discards = G.GAME.round_resets.discards + ${valueCode}
        ease_discard(${valueCode})
        `;
      } else if (duration === "round") {
        editDiscardCode = `G.GAME.current_round.discards_left = G.GAME.current_round.discards_left + ${valueCode}`;
      }
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Discard"`;
      discardsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.ORANGE})
                    ${editDiscardCode}
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    case "subtract": {
      if (duration === "permanent") {
        editDiscardCode = `
        G.GAME.round_resets.discards = G.GAME.round_resets.discards - ${valueCode}
        ease_discard(-${valueCode})
        `;
      } else if (duration === "round") {
        editDiscardCode = `G.GAME.current_round.discards_left = G.GAME.current_round.discards_left - ${valueCode}`;
      }
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." Discard"`;
      discardsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
                    ${editDiscardCode}
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    case "set": {
      if (duration === "permanent") {
        editDiscardCode = `
        G.GAME.round_resets.discards = ${valueCode}
        ease_discard(${valueCode} - G.GAME.current_round.discards_left)
        `;
      } else if (duration === "round") {
        editDiscardCode = `G.GAME.current_round.discards_left = ${valueCode}`;
      }
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Set to "..tostring(${valueCode}).." Discards"`;
      discardsCode = `
            __PRE_RETURN_CODE__
            local mod = ${valueCode} - G.GAME.round_resets.discards
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
                    ${editDiscardCode}
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
      : [`discards_value = ${value}`];

  return {
    statement: discardsCode,
    colour: "G.C.ORANGE",
    configVariables,
  };
};
