import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import {
  generateConfigVariables
} from "../gameVariableUtils";

export const generateModifyBlindRequirementReturn = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = effect.params?.operation || "multiply";
  const variableName =
    sameTypeCount === 0 ? "blind_size" : `blind_size${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName
  )

  const customMessage = effect.customMessage;
  let statement = "";

  switch (operation) {
    case "add": {
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Blind Size"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.GREEN})
                G.GAME.blind.chips = G.GAME.blind.chips + ${valueCode}
                G.GAME.blind.chip_text = number_format(G.GAME.blind.chips)
                G.HUD_blind:recalculate()
                return true
            end`;
      break;
    }
    case "subtract": {
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." Blind Size"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.GREEN})
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
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${multiplyMessage}, colour = G.C.GREEN})
                G.GAME.blind.chips = G.GAME.blind.chips * ${valueCode}
                G.GAME.blind.chip_text = number_format(G.GAME.blind.chips)
                G.HUD_blind:recalculate()
                return true
            end`;
      break;
    }
    case "divide": {
      const divideMessage = customMessage
        ? `"${customMessage}"`
        : `"/"..tostring(${valueCode}).." Blind Size"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${divideMessage}, colour = G.C.GREEN})
                G.GAME.blind.chips = G.GAME.blind.chips / ${valueCode}
                G.GAME.blind.chip_text = number_format(G.GAME.blind.chips)
                G.HUD_blind:recalculate()
                return true
            end`;
      break;
    }
    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Set to "..tostring(${valueCode}).." Blind Size"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.GREEN})
                G.GAME.blind.chips = ${valueCode}
                G.GAME.blind.chip_text = number_format(G.GAME.blind.chips)
                G.HUD_blind:recalculate()
                return true
            end`;
        break
    }
    default: {
      const multiplyMessage = customMessage
        ? `"${customMessage}"`
        : `"X"..tostring(${valueCode}).." Blind Size"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${multiplyMessage}, colour = G.C.GREEN})
                G.GAME.blind.chips = G.GAME.blind.chips * ${valueCode}
                G.GAME.blind.chip_text = number_format(G.GAME.blind.chips)
                G.HUD_blind:recalculate()
                return true
            end`;
    }
  }

  return {
    statement,
    colour: "G.C.GREEN",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };
};