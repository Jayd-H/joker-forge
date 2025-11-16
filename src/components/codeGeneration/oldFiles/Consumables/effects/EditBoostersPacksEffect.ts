import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditBoostersReturn = (
effect: Effect,
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value;
  const selected_type = effect.params?.selected_type || "size";
  const customMessage = effect.customMessage;

  const valueCode = generateGameVariableCode(value);

  let EditBoosterCode = "";


if (selected_type !== "none") { 
 if (selected_type === "size") {
    switch (operation) {
    case "add": {
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Booster Size"`;
        EditBoosterCode += `
        G.E_MANAGER:add_event(Event({
            trigger = 'after',
            delay = 0.4,        
            func = function()
            card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.BLUE})
        G.GAME.modifiers.booster_size_mod = (G.GAME.modifiers.booster_size_mod or 0) +${valueCode}
                return true
            end
        }))`;
    break;
    }
    case "subtract": {
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." Booster Size"`;
        EditBoosterCode += `
        G.E_MANAGER:add_event(Event({
        trigger = 'after',
            delay = 0.4,    
            func = function()
            card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.BLUE})
        G.GAME.modifiers.booster_size_mod = (G.GAME.modifiers.booster_size_mod or 0) -${valueCode}
                return true
            end
        }))`;
     break;
    }
    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Booster Size "..tostring(${valueCode})`;
        EditBoosterCode += `
        G.E_MANAGER:add_event(Event({
        trigger = 'after',
            delay = 0.4,    
            func = function()
            card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
        G.GAME.modifiers.booster_size_mod = ${valueCode}
                return true
            end
        }))`;
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
        G.E_MANAGER:add_event(Event({
        trigger = 'after',
            delay = 0.4,    
            func = function()
        card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.BLUE})
        G.GAME.modifiers.booster_choice_mod = (G.GAME.modifiers.booster_choice_mod or 0) +${valueCode}
                return true
            end
        }))`;
  break;
    }
    case "subtract": {
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." Booster Choice"`;
        EditBoosterCode += `
        G.E_MANAGER:add_event(Event({
        trigger = 'after',
            delay = 0.4,    
            func = function()
            card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.BLUE})
        G.GAME.modifiers.booster_choice_mod = (G.GAME.modifiers.booster_choice_mod or 0) -${valueCode}
                return true
            end
        }))`;
  break;
    }
    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Booster Choice "..tostring(${valueCode})`;
        EditBoosterCode += `
        G.E_MANAGER:add_event(Event({
        trigger = 'after',
            delay = 0.4,    
            func = function()
        card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
        G.GAME.modifiers.booster_choice_mod = ${valueCode}
                return true
            end
        }))`;
   }
  }
 }
}

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`Edited_booster = ${value}`];

  return {
    statement: EditBoosterCode,
    colour: "G.C.BLUE",
    configVariables,
  };
};
