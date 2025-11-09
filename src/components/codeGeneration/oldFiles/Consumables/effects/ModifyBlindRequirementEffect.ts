import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateModifyBlindRequirementReturn = (
  effect: Effect,
): EffectReturn => {
  const operation = effect.params?.operation || "multiply";
  const value = effect.params?.value ?? 2

  const valueCode = generateGameVariableCode(value);

  const customMessage = effect.customMessage;
  let BlindCode = "";

  switch (operation) {
    case "add": {
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Blind Size"`;
      BlindCode = `G.E_MANAGER:add_event(Event({
      func = function()
                card_eval_status_text(card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.GREEN})
                G.GAME.blind.chips = G.GAME.blind.chips + ${valueCode}
                G.GAME.blind.chip_text = number_format(G.GAME.blind.chips)
                G.HUD_blind:recalculate()
                return true
            end
                    }))
        delay(0.5)`;
      break;
    }
    case "subtract": {
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." Blind Size"`;
      BlindCode = `G.E_MANAGER:add_event(Event({
      func = function()
                card_eval_status_text(card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.GREEN})
                G.GAME.blind.chips = G.GAME.blind.chips - ${valueCode}
                G.GAME.blind.chip_text = number_format(G.GAME.blind.chips)
                G.HUD_blind:recalculate()
                return true
            end`;
      break;
    }
    case "multiply": {
      const multiplyMessage = customMessage
        ? `"${customMessage}"`
        : `"X"..tostring(${valueCode}).." Blind Size"`;
      BlindCode = `G.E_MANAGER:add_event(Event({
      func = function()
                card_eval_status_text(card, 'extra', nil, nil, nil, {message = ${multiplyMessage}, colour = G.C.GREEN})
                G.GAME.blind.chips = G.GAME.blind.chips * ${valueCode}
                G.GAME.blind.chip_text = number_format(G.GAME.blind.chips)
                G.HUD_blind:recalculate()
                return true
            end
                    }))
        delay(0.5)`;
      break;
    }
    case "divide": {
      const divideMessage = customMessage
        ? `"${customMessage}"`
        : `"/"..tostring(${valueCode}).." Blind Size"`;
      BlindCode = `G.E_MANAGER:add_event(Event({
      func = function()
                card_eval_status_text(card, 'extra', nil, nil, nil, {message = ${divideMessage}, colour = G.C.GREEN})
                G.GAME.blind.chips = G.GAME.blind.chips / ${valueCode}
                G.GAME.blind.chip_text = number_format(G.GAME.blind.chips)
                G.HUD_blind:recalculate()
                return true
            end
                    }))
        delay(0.5)`;
      break;
    }
    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Set to "..tostring(${valueCode}).." Blind Size"`;
      BlindCode = `G.E_MANAGER:add_event(Event({
      func = function()
                card_eval_status_text(card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.GREEN})
                G.GAME.blind.chips = ${valueCode}
                G.GAME.blind.chip_text = number_format(G.GAME.blind.chips)
                G.HUD_blind:recalculate()
                return true
            end
                    }))
        delay(0.5)`;
        break
    }
    default: {
      const multiplyMessage = customMessage
        ? `"${customMessage}"`
        : `"X"..tostring(${valueCode}).." Blind Size"`;
      BlindCode = `func = function()
                card_eval_status_text(card, 'extra', nil, nil, nil, {message = ${multiplyMessage}, colour = G.C.GREEN})
                G.GAME.blind.chips = G.GAME.blind.chips * ${valueCode}
                G.GAME.blind.chip_text = number_format(G.GAME.blind.chips)
                G.HUD_blind:recalculate()
                return true
            end
                    }))
        delay(0.5)`;
    }
  }

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`blind_size_value = ${value}`];

  return {
    statement: BlindCode,
    colour: "G.C.GREEN",
    configVariables,
  };
};