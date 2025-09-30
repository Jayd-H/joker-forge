import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditInterestCapReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value;

  const valueCode = generateGameVariableCode(value);

  let CapSizeCode = "";

    if (operation === "add") {
        CapSizeCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.interest_cap = G.GAME.interest_cap +${valueCode}
                return true
            end
        }))
        `;
  } else if (operation === "subtract") {
        CapSizeCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.interest_cap = G.GAME.interest_cap -${valueCode}
                return true
            end
        }))
        `;
  } else if (operation === "set") {
        CapSizeCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
    G.GAME.interest_cap = ${valueCode}
                return true
            end
        }))
        `;
  }

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`hand_size_value = ${value}`];

  return {
    statement: CapSizeCode,
    colour: "G.C.BLUE",
    configVariables,
  };
};
