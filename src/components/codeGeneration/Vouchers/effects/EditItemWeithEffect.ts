import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditItemWeightReturn = (
effect: Effect,
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value;
  const selected_card = effect.params?.selected_card || "none";
  const selected_rarity = effect.params?.selected_rarity || "none";

  const valueCode = generateGameVariableCode(value);

  let ItemWeightCode = "";

if (selected_card !== "none") {
    if (operation === "add") {
        ItemWeightCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.${selected_card}_rate = G.GAME.${selected_card}_rate +${valueCode}
                return true
            end
        }))
        `;
  } else if (operation === "subtract") {
        ItemWeightCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.${selected_card}_rate = G.GAME.${selected_card}_rate -${valueCode}
                return true
            end
        }))
        `;
  } else if (operation === "set") {
        ItemWeightCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.${selected_card}_rate = ${valueCode}
                return true
            end
        }))
        `;
  }
}

if (selected_rarity !== "none") {
    if (operation === "add") {
        ItemWeightCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.${selected_rarity}_mod = G.GAME.${selected_rarity}_mod +${valueCode}
                return true
            end
        }))
        `;
  } else if (operation === "subtract") {
        ItemWeightCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.${selected_rarity}_mod = G.GAME.${selected_rarity}_mod -${valueCode}
                return true
            end
        }))
        `;
  } else if (operation === "set") {
        ItemWeightCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.${selected_rarity}_mod = ${valueCode}
                return true
            end
        }))
        `;
  }
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
