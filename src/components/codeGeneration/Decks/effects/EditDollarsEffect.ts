import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditDollarsReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value;

  const valueCode = generateGameVariableCode(value);

  let dollarsCode = "";

    if (operation === "add") {
        dollarsCode += `
        G.GAME.starting_params.dollars = G.GAME.starting_params.dollars + ${valueCode}
        `;
  } else if (operation === "subtract") {
        dollarsCode += `
        G.GAME.starting_params.dollars = G.GAME.starting_params.dollars - ${valueCode}
        `;
  } else if (operation === "set") {
        dollarsCode += `
          G.GAME.starting_params.dollars = ${valueCode}
        `;
  }

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`dollars_value = ${value}`];

  return {
    statement: dollarsCode,
    colour: "G.C.MONEY",
    configVariables,
  };
};
