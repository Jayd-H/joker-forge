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
        G.GAME.starting_params.consumable_slots = G.GAME.starting_params.consumable_slots + ${valueCode}
        `;
  } else if (operation === "subtract") {
        addToDeck += `
        G.GAME.starting_params.consumable_slots = G.GAME.starting_params.consumable_slots - ${valueCode})
        `;
  } else if (operation === "set") {
        addToDeck += `
G.GAME.starting_params.consumable_slots = ${valueCode}
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
