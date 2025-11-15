import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditDiscardSizeReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value;

  const valueCode = generateGameVariableCode(value);

  let discardSizeCode = "";

    if (operation === "add") {
        discardSizeCode += `
        SMODS.change_discard_limit(${valueCode})
        `;
  } else if (operation === "subtract") {
        discardSizeCode += `
        SMODS.change_discard_limit(-${valueCode})
        `;
  } else if (operation === "set") {
        discardSizeCode += `
local current_hand_size = G.hand.config.card_limit
                    local target_hand_size = ${valueCode}
                    local difference = target_hand_size - current_hand_size
                    SMODS.change_discard_limit(difference)
        `;
  }

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`hand_size_value = ${value}`];

  return {
    statement: discardSizeCode,
    colour: "G.C.BLUE",
    configVariables,
  };
};
