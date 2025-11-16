import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateSetAnteReturn = (effect: Effect): EffectReturn => {

  const operation = effect.params?.operation || "set";
  const value = effect.params?.value ?? 5;
  const valueCode = generateGameVariableCode(value);

  const customMessage = effect.customMessage;

  let anteCode = "";
  
  switch (operation) {
    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Ante set to "..tostring(${valueCode})`;
      anteCode = `
            __PRE_RETURN_CODE__
local mod = ${valueCode} - G.GAME.round_resets.ante
		ease_ante(mod)
		G.E_MANAGER:add_event(Event({
			func = function()
				G.GAME.round_resets.blind_ante = ${valueCode}
        card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.YELLOW})
				return true
			end,
		}))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    case "add": {
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Ante"`;
      anteCode = `
            __PRE_RETURN_CODE__
local mod = ${valueCode}
		ease_ante(mod)
		G.E_MANAGER:add_event(Event({
			func = function()
				G.GAME.round_resets.blind_ante = G.GAME.round_resets.blind_ante + mod
        card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.YELLOW})
				return true
			end,
		}))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    case "subtract": {
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." Ante"`;
      anteCode = `
            __PRE_RETURN_CODE__
local mod = -${valueCode}
		ease_ante(mod)
		G.E_MANAGER:add_event(Event({
			func = function()
				G.GAME.round_resets.blind_ante = G.GAME.round_resets.blind_ante + mod
        card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
				return true
			end,
    }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    default: {
      const defaultMessage = customMessage
        ? `"${customMessage}"`
        : `"Ante set to "..tostring(${valueCode})`;
      anteCode = `
            __PRE_RETURN_CODE__
local mod = ${valueCode} - G.GAME.round_resets.ante
		ease_ante(mod)
		G.E_MANAGER:add_event(Event({
			func = function()
				G.GAME.round_resets.blind_ante = ${valueCode}
        card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${defaultMessage}, colour = G.C.YELLOW})
				return true
			end,
		}))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
  }

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`ante_level = ${value}`];

  return {
    statement: anteCode,
    colour: "G.C.YELLOW",
    configVariables,
  };
};
