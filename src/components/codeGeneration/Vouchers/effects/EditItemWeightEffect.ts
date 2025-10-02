import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditItemWeightReturn = (
effect: Effect,
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value;
  const key = effect.params.key as string || "";

  const valueCode = generateGameVariableCode(value);

  let ItemWeightCode = "";

    if (operation === "add") {
        ItemWeightCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.${key}_rate = G.GAME.${key}_rate +${valueCode}
                return true
            end
        }))
        `;
  } else if (operation === "subtract") {
        ItemWeightCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.${key}_rate = G.GAME.${key}_rate -${valueCode}
                return true
            end
        }))
        `;
  } else if (operation === "set") {
        ItemWeightCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.${key}_rate = ${valueCode}
                return true
            end
        }))
        `;
  } else if (operation === "multiply") {
        ItemWeightCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.${key}_rate = G.GAME.${key}_rate *${valueCode}
                return true
            end
        }))
        `;
  } else if (operation === "divide") {
        ItemWeightCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.${key}_rate = G.GAME.${key}_rate /${valueCode}
                return true
            end
        }))
        `;
  }    

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`item_rate = ${value}`];

  return {
    statement: ItemWeightCode,
    colour: "G.C.BLUE",
    configVariables,
  };
};
