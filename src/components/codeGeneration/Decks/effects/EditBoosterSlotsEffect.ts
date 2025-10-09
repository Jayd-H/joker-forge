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
         G.GAME.starting_params.booster_slots = G.GAME.starting_params.booster_slots + ${valueCode}
        `;
  } else if (operation === "subtract") {
        boosterSlotsCode += `
        G.GAME.starting_params.booster_slots = G.GAME.starting_params.booster_slots - ${valueCode}
        `;
  } else if (operation === "set") {
        boosterSlotsCode += `
        G.GAME.starting_params.booster_slots = ${valueCode}
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
