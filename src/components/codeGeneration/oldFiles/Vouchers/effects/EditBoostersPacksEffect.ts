import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditBoostersReturn = (
effect: Effect,
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value;
  const selected_type = effect.params?.selected_type || "size";

  const valueCode = generateGameVariableCode(value);

  let EditBoosterCode = "";


if (selected_type !== "none") { 
 if (selected_type === "size") {
    if (operation === "add") {
        EditBoosterCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.modifiers.booster_size_mod = (G.GAME.modifiers.booster_size_mod or 0) +${valueCode}
                return true
            end
        }))
        `;
  } else if (operation === "subtract") {
        EditBoosterCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.modifiers.booster_size_mod = (G.GAME.modifiers.booster_size_mod or 0) -${valueCode}
                return true
            end
        }))
        `;
  } else if (operation === "set") {
        EditBoosterCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.modifiers.booster_size_mod = ${valueCode}
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
                return true
            end
        }))
        `;
  } else if (operation === "subtract") {
        EditBoosterCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.modifiers.booster_choice_mod = (G.GAME.modifiers.booster_choice_mod or 0) -${valueCode}
                return true
            end
        }))
        `;
  } else if (operation === "set") {
        EditBoosterCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.modifiers.booster_choice_mod = ${valueCode}
                return true
            end
        }))
        `;
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
