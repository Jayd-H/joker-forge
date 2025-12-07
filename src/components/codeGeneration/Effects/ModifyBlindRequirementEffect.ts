import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";
import { generateConfigVariables } from "../lib/gameVariableUtils";

export const generateModifyBlindRequirementEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0,
): EffectReturn => {
  const operation = (effect.params?.operation?.value as string) || "multiply";
  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
    "blind_size",
    sameTypeCount,
    itemType
  )
  const target = 
    (itemType === "joker") ? "context.blueprint_card or card" : 
    (itemType === "consumable") ? "used_card" : "card"

  const customMessage = effect.customMessage;
  let statement = "";

  switch (operation) {
    case "add": {
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Blind Size"`;
      statement = `
        card_eval_status_text(${target}, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.GREEN})
        G.GAME.blind.chips = G.GAME.blind.chips + ${valueCode}
        G.GAME.blind.chip_text = number_format(G.GAME.blind.chips)
        G.HUD_blind:recalculate()
        return true`;
      break;
    }
    case "subtract": {
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." Blind Size"`;
      statement = `
        card_eval_status_text(${target}, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.GREEN})
        G.GAME.blind.chips = G.GAME.blind.chips - ${valueCode}
        G.GAME.blind.chip_text = number_format(G.GAME.blind.chips)
        G.HUD_blind:recalculate()
        return true`;
      break;
    }
    case "multiply": {
      const multiplyMessage = customMessage
        ? `"${customMessage}"`
        : `"X"..tostring(${valueCode}).." Blind Size"`;
      statement = `
        card_eval_status_text(${target}, 'extra', nil, nil, nil, {message = ${multiplyMessage}, colour = G.C.GREEN})
        G.GAME.blind.chips = G.GAME.blind.chips * ${valueCode}
        G.GAME.blind.chip_text = number_format(G.GAME.blind.chips)
        G.HUD_blind:recalculate()
        return true`;
      break;
    }
    case "divide": {
      const divideMessage = customMessage
        ? `"${customMessage}"`
        : `"/"..tostring(${valueCode}).." Blind Size"`;
      statement = `
        card_eval_status_text(${target}, 'extra', nil, nil, nil, {message = ${divideMessage}, colour = G.C.GREEN})
        G.GAME.blind.chips = G.GAME.blind.chips / ${valueCode}
        G.GAME.blind.chip_text = number_format(G.GAME.blind.chips)
        G.HUD_blind:recalculate()
        return true`;
      break;
    }
    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Set to "..tostring(${valueCode}).." Blind Size"`;
      statement = `
        card_eval_status_text(${target}, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.GREEN})
        G.GAME.blind.chips = ${valueCode}
        G.GAME.blind.chip_text = number_format(G.GAME.blind.chips)
        G.HUD_blind:recalculate()
        return true`;
      break
    }
    default: {
      const multiplyMessage = customMessage
        ? `"${customMessage}"`
        : `"X"..tostring(${valueCode}).." Blind Size"`;
      statement = `
          if G.GAME.blind.in_blind then
            card_eval_status_text(${target}, 'extra', nil, nil, nil, {message = ${multiplyMessage}, colour = G.C.GREEN})
            G.GAME.blind.chips = G.GAME.blind.chips * ${valueCode}
            G.GAME.blind.chip_text = number_format(G.GAME.blind.chips)
            G.HUD_blind:recalculate()
            return true`;
    }
  }
  
  statement = `
    func = function()
      if G.GAME.blind.in_blind then
      ${statement}
      end
    end`

  return {
    statement,
    colour: "G.C.GREEN",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };
}