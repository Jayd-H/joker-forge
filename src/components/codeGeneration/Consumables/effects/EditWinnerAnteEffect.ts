import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditWinnerAnteReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "set";
  const value = effect.params?.value
  const customMessage = effect.customMessage;

  const valueCode = generateGameVariableCode(value);

  let EditWinCode = "";

      switch (operation) {
    case "add": {
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Ante to Win"`;
      EditWinCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.BLUE})
                    local ante = G.GAME.win_ante + ${valueCode}
                    local int_part, frac_part = math.modf(ante)
                    local rounded = int_part + (frac_part >= 0.5 and 1 or 0)
                    G.GAME.win_ante = rounded
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
        : `"-"..tostring(${valueCode}).." Ante to Win"`;
      EditWinCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
                    local ante = G.GAME.win_ante - ${valueCode}
                    local int_part, frac_part = math.modf(ante)
                    local rounded = int_part + (frac_part >= 0.5 and 1 or 0)
                    G.GAME.win_ante = rounded
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
        : `"Winner Ante set to "..tostring(${valueCode})`;
      EditWinCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
                    G.GAME.win_ante = ${valueCode}
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
        : `"Winner Ante set to "..tostring(${valueCode}"`;
      EditWinCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${defaultMessage}, colour = G.C.BLUE})
                    G.GAME.win_ante = ${valueCode}
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
      : [`ante_win_value = ${value}`];

  return {
    statement: EditWinCode,
    colour: "G.C.BLUE",
    configVariables,
  };
};
