import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditRarityWeightReturn = (
effect: Effect,
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value;
  const key_rarity = effect.params.key_rarity as string || "";

  const valueCode = generateGameVariableCode(value);

  let RarityWeightCode = "";

    if (operation === "add") {
        RarityWeightCode += `
        G.GAME.${key_rarity}_mod = G.GAME.${key_rarity}_mod +${valueCode}
        `;
  } else if (operation === "subtract") {
        RarityWeightCode += `
        G.GAME.${key_rarity}_mod = G.GAME.${key_rarity}_mod -${valueCode}
        `;
  } else if (operation === "set") {
        RarityWeightCode += `
        G.GAME.${key_rarity}_mod = ${valueCode}
        `;
  } else if (operation === "multiply") {
        RarityWeightCode += `
        G.GAME.${key_rarity}_mod = G.GAME.${key_rarity}_mod *${valueCode}
        `;
  } else if (operation === "divide") {
        RarityWeightCode += `
        G.GAME.${key_rarity}_mod = G.GAME.${key_rarity}_mod /${valueCode}
        `;
  }

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`rarity_rate = ${value}`];

  return {
    statement: RarityWeightCode,
    colour: "G.C.BLUE",
    configVariables,
  };
};
