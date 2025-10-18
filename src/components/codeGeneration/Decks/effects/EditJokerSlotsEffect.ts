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
        G.GAME.starting_params.joker_slots = G.GAME.starting_params.joker_slots + ${valueCode}
        `;
  } else if (operation === "subtract") {
        jokerSlotsCode += `
        G.GAME.starting_params.joker_slots = G.GAME.starting_params.joker_slots - ${valueCode}
        `;
  } else if (operation === "set") {
        jokerSlotsCode += `
   G.GAME.starting_params.joker_slots = ${valueCode}
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
