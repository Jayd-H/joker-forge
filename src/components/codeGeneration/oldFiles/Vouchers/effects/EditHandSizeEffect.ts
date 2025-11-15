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
        G.hand:change_size(${valueCode})
        `;
  } else if (operation === "subtract") {
        handSizeCode += `
        G.hand:change_size(-${valueCode})
        `;
  } else if (operation === "set") {
        handSizeCode += `
          local current_hand_size = G.hand.config.card_limit
          local target_hand_size = ${valueCode}
          local difference = target_hand_size - current_hand_size
        G.hand:change_size(difference)
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
