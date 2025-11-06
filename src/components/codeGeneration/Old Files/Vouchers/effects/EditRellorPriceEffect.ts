import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditRellorPriceReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  
  const value = effect.params?.value || 1;

  const valueCode = generateGameVariableCode(value);

  let RelorrsCode = "";

    if (operation === "add") {
        RelorrsCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
                G.GAME.round_resets.reroll_cost = G.GAME.round_resets.reroll_cost + ${valueCode}
                G.GAME.current_round.reroll_cost = math.max(0,
                G.GAME.current_round.reroll_cost + ${valueCode})
                return true
            end
        }))
        `;
  } else if (operation === "subtract") {
        RelorrsCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
                G.GAME.round_resets.reroll_cost = G.GAME.round_resets.reroll_cost - ${valueCode}
                G.GAME.current_round.reroll_cost = math.max(0,
                G.GAME.current_round.reroll_cost - ${valueCode})
                return true
            end
        }))
        `;
  }

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`rellor_price_value = ${value}`];

  return {
    statement: RelorrsCode,
    colour: "G.C.BLUE",
    configVariables,
  };
};
