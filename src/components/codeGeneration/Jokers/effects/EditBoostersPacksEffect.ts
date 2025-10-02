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
    if (operation === "add") {
        EditBoosterCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.modifiers.booster_size_mod = (G.GAME.modifiers.booster_size_mod or 0) +${valueCode}
        card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${customMessage}, colour = G.C.DARK_EDITION})
                return true
            end
        }))
        `;
  } else if (operation === "subtract") {
        EditBoosterCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.modifiers.booster_size_mod = (G.GAME.modifiers.booster_size_mod or 0) -${valueCode}
        card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${customMessage}, colour = G.C.DARK_EDITION})
                return true
            end
        }))
        `;
  } else if (operation === "set") {
        EditBoosterCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.modifiers.booster_size_mod = ${valueCode}
        card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${customMessage}, colour = G.C.DARK_EDITION})
                return true
            end
        }))
        `;
  }
}

if (selected_type === "choice") {
    if (operation === "add") {
        EditBoosterCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.modifiers.booster_choice_mod = (G.GAME.modifiers.booster_choice_mod or 0) +${valueCode}
        card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${customMessage}, colour = G.C.DARK_EDITION})
                return true
            end
        }))
        `;
  } else if (operation === "subtract") {
        EditBoosterCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.modifiers.booster_choice_mod = (G.GAME.modifiers.booster_choice_mod or 0) -${valueCode}
        card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${customMessage}, colour = G.C.DARK_EDITION})
                return true
            end
        }))
        `;
  } else if (operation === "set") {
        EditBoosterCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.modifiers.booster_choice_mod = ${valueCode}
        card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${customMessage}, colour = G.C.DARK_EDITION})
                return true
            end
        }))
        `;
  }
 }
}

  return {
    statement: EditBoosterCode,
    colour: "G.C.BLUE",
    configVariables,
  };
};
