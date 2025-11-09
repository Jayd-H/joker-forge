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
        ease_dollars(${valueCode}, true)
        `;
  } else if (operation === "subtract") {
        dollarsCode += `
        ease_dollars(-math.min(G.GAME.dollars, ${valueCode}), true)
        `;
  } else if (operation === "set") {
        dollarsCode += `
          local current_dollars = G.GAME.dollars
                    local target_dollars = ${valueCode}
                    local difference = target_dollars - current_dollars
                    ease_dollars(difference, true)
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
