import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditItemWeightReturn = (
effect: Effect,
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value;
  const key = effect.params.key as string || "";

  const valueCode = generateGameVariableCode(value);

  let ItemWeightCode = "";

    if (operation === "add") {
        ItemWeightCode += `
        G.GAME.${key}_rate = G.GAME.${key}_rate +${valueCode}
        `;
  } else if (operation === "subtract") {
        ItemWeightCode += `
        G.GAME.${key}_rate = G.GAME.${key}_rate -${valueCode}
        `;
  } else if (operation === "set") {
        ItemWeightCode += `
        G.GAME.${key}_rate = ${valueCode}
        `;
  } else if (operation === "multiply") {
        ItemWeightCode += `
        G.GAME.${key}_rate = G.GAME.${key}_rate *${valueCode}
        `;
  } else if (operation === "divide") {
        ItemWeightCode += `
        G.GAME.${key}_rate = G.GAME.${key}_rate /${valueCode}
        `;
  }    

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`item_rate = ${value}`];

  return {
    statement: ItemWeightCode,
    colour: "G.C.BLUE",
    configVariables,
  };
};
