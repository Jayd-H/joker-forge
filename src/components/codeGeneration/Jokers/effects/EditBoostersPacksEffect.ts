import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import {
  generateConfigVariables,
} from "../gameVariableUtils";

export const generateEditBoostersReturn = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const selected_type = effect.params?.selected_type || "size";
  const customMessage = effect.customMessage;

 const variableName =
    sameTypeCount === 0 ? "booster_packs_edit" : `booster_packs_edit${sameTypeCount + 1}`;
  
  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName
  )

  let EditBoosterCode = "";


if (selected_type !== "none") { 
 if (selected_type === "size") {
    switch (operation) {
    case "add": {
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Booster Size"`;
        EditBoosterCode += `
            func = function()
        card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.DARK_EDITION})
        G.GAME.modifiers.booster_size_mod = (G.GAME.modifiers.booster_size_mod or 0) +${valueCode}
                return true
            end`;
    break;
    }
    case "subtract": {
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." Booster Size"`;
        EditBoosterCode += `
            func = function()
            card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
        G.GAME.modifiers.booster_size_mod = (G.GAME.modifiers.booster_size_mod or 0) -${valueCode}
                return true
            end`;
     break;
    }
    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Booster Size "..tostring(${valueCode})`;
        EditBoosterCode += `
            func = function()
            card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
        G.GAME.modifiers.booster_size_mod = ${valueCode}
                return true
            end`;
  }
 }
}

if (selected_type === "choice") {
    switch (operation) {
    case "add": {
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Booster Choice"`;
        EditBoosterCode += `
            func = function()
        card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.DARK_EDITION})
        G.GAME.modifiers.booster_choice_mod = (G.GAME.modifiers.booster_choice_mod or 0) +${valueCode}
                return true
            end`;
  break;
    }
    case "subtract": {
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." Booster Choice"`;
        EditBoosterCode += `
            func = function()
            card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
        G.GAME.modifiers.booster_choice_mod = (G.GAME.modifiers.booster_choice_mod or 0) -${valueCode}
                return true
            end`;
  break;
    }
    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Booster Choice "..tostring(${valueCode})`;
        EditBoosterCode += `
            func = function()
        card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
        G.GAME.modifiers.booster_choice_mod = ${valueCode}
                return true
            end`;
   }
  }
 }
}

  return {
    statement: EditBoosterCode,
    colour: "G.C.BLUE",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };
};
