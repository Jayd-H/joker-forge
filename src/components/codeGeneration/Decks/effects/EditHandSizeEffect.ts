import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditHandSizeReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value;

  const valueCode = generateGameVariableCode(value);

  let handSizeCode = "";

    if (operation === "add") {
        handSizeCode += `
        G.GAME.starting_params.hand_size = G.GAME.starting_params.hand_size + ${valueCode}
        `;
  } else if (operation === "subtract") {
        handSizeCode += `
        G.GAME.starting_params.hand_size = G.GAME.starting_params.hand_size - ${valueCode}
        `;
  } else if (operation === "set") {
        handSizeCode += `
          G.GAME.starting_params.hand_size = ${valueCode}
        `;
  }

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`hand_size_value = ${value}`];

  return {
    statement: handSizeCode,
    colour: "G.C.BLUE",
    configVariables,
  };
};
