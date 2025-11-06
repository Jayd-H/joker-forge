import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateSetAnteReturn = (effect: Effect): EffectReturn => {

  const operation = effect.params?.operation || "set";
  const value = effect.params?.value ?? 5;
  const valueCode = generateGameVariableCode(value);

  let anteCode = "";
  
    if (operation === "add") {
        anteCode += `local mod = ${valueCode}
        ease_ante(mod)
        G.GAME.round_resets.blind_ante = G.GAME.round_resets.blind_ante + mod
        `;
  } else if (operation === "subtract") {
        anteCode += `local mod = -${valueCode}
        ease_ante(mod)
        G.GAME.round_resets.blind_ante = G.GAME.round_resets.blind_ante + mod
        `;
  } else if (operation === "set") {
        anteCode += `local mod = ${valueCode} - G.GAME.round_resets.ante
        ease_ante(mod)
     G.GAME.round_resets.blind_ante = ${valueCode}
        `;
  }

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`ante_level = ${value}`];

  return {
    statement: anteCode,
    colour: "G.C.YELLOW",
    configVariables,
  };
};
