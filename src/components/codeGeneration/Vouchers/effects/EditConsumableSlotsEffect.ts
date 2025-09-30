import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateConsumableSlots = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value || 1;

  const valueCode = generateGameVariableCode(value);

  let addToDeck = "";

    if (operation === "add") {
        addToDeck += `
         G.E_MANAGER:add_event(Event({
            func = function()
        G.consumeables.config.card_limit = G.consumeables.config.card_limit + ${valueCode}
                return true
            end
        }))
        `;
  } else if (operation === "subtract") {
        addToDeck += `
         G.E_MANAGER:add_event(Event({
            func = function()
        G.consumeables.config.card_limit = math.max(0, G.consumeables.config.card_limit - ${valueCode})
                return true
            end
        }))
        `;
  } else if (operation === "set") {
        addToDeck += `
         G.E_MANAGER:add_event(Event({
            func = function()
G.consumeables.config.card_limit = ${valueCode}
                return true
            end
        }))
        `;
  }

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`voucher_slots_value = ${value}`];

  return {
    statement: addToDeck,
    colour: "G.C.BLUE",
    configVariables,
  };
};
