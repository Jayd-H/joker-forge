import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditWinnerAnteReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "set";
  const value = effect.params?.value

  const valueCode = generateGameVariableCode(value);

  let statement = "";

     if (operation === "add") {
        statement += `
        G.E_MANAGER:add_event(Event({
                func = function()
                    local ante = G.GAME.win_ante + ${valueCode}
                    local int_part, frac_part = math.modf(ante)
                    local rounded = int_part + (frac_part >= 0.5 and 1 or 0)
                    G.GAME.win_ante = rounded
                    return true
                end
            }))
        `;
  } else if (operation === "subtract") {
        statement += `
        G.E_MANAGER:add_event(Event({
                func = function()
                    local ante = G.GAME.win_ante - ${valueCode}
                    local int_part, frac_part = math.modf(ante)
                    local rounded = int_part + (frac_part >= 0.5 and 1 or 0)
                    G.GAME.win_ante = rounded
                    return true
                end
            }))
        `;
  } else if (operation === "set") {
        statement += `
        G.E_MANAGER:add_event(Event({
                func = function()
                    G.GAME.win_ante = ${valueCode}
                    return true
                end
            }))
            `;
  }

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`ante_win_value = ${value}`];

  return {
    statement,
    colour: "G.C.BLUE",
    configVariables,
  };
};
