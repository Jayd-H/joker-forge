import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditJokerSlotsReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value;

  const valueCode = generateGameVariableCode(value);

  let jokerSlotsCode = "";

    if (operation === "add") {
        jokerSlotsCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.jokers.config.card_limit = G.jokers.config.card_limit + ${valueCode}
                return true
            end
        }))
        `;
  } else if (operation === "subtract") {
        jokerSlotsCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.jokers.config.card_limit = math.max(1, G.jokers.config.card_limit - ${valueCode})
                return true
            end
        }))
        `;
  } else if (operation === "set") {
        jokerSlotsCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
G.jokers.config.card_limit = ${valueCode}
                return true
            end
        }))
        `;
  }

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`joker_slots_value = ${value}`];

  return {
    statement: jokerSlotsCode,
    colour: "G.C.DARK_EDITION",
    configVariables,
  };
};
