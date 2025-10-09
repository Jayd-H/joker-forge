import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditPlaySizeReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value

  const valueCode = generateGameVariableCode(value);

  let statement = "";

     if (operation === "add") {
        statement += `
        G.E_MANAGER:add_event(Event({
          func = function()
        SMODS.change_play_limit(${valueCode})
             return true
          end
      }))
        `;
  } else if (operation === "subtract") {
        statement += `
        G.E_MANAGER:add_event(Event({
          func = function()
        SMODS.change_play_limit(-${valueCode})
             return true
          end
      }))
        `;
  } else if (operation === "set") {
        statement += `
        G.E_MANAGER:add_event(Event({
          func = function()
        local current_hand_size = G.GAME.starting_params.play_limit
                    local target_hand_size = ${valueCode}
                    local difference = target_hand_size - current_hand_size
                    SMODS.change_play_limit(difference)
             return true
          end
      }))
            `;
  }

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`play_size_value = ${value}`];

  return {
    statement,
    colour: "G.C.BLUE",
    configVariables,
  };
};
