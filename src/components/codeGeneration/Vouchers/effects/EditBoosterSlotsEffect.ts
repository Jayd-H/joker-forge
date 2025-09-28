import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditBoosterSlotsReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value || 1;

  const valueCode = generateGameVariableCode(value);

  let boosterSlotsCode = "";

    if (operation === "add") {
        boosterSlotsCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        SMODS.change_booster_limit(${valueCode})
                return true
            end
        }))
        `;
  } else if (operation === "subtract") {
        boosterSlotsCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        SMODS.change_booster_limit(-${valueCode})
                return true
            end
        }))
        `;
  } else if (operation === "set") {
        boosterSlotsCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
local current_hand_size = G.hand.config.card_limit
                    local target_hand_size = ${valueCode}
                    local difference = target_hand_size - current_hand_size
                    SMODS.change_booster_limit(difference)
                return true
            end
        }))
        `;
  }
  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`booster_slots_value = ${value}`];

  return {
    statement: boosterSlotsCode,
    colour: "G.C.BLUE",
    configVariables,
  };
};
