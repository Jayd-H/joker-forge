import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditPlaySizeReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value || 1;

  const valueCode = generateGameVariableCode(value);

  let playSizeCode = "";

     if (operation === "add") {
        playSizeCode += `
        SMODS.change_play_limit(${valueCode})
        `;
  } else if (operation === "subtract") {
        playSizeCode += `
        SMODS.change_play_limit(-${valueCode})
        `;
  } else if (operation === "set") {
        playSizeCode += `
            local current_hand_size = G.hand.config.card_limit
                    local target_hand_size = ${valueCode}
                    local difference = target_hand_size - current_hand_size
                    SMODS.change_play_limit(difference)
        `;
  }

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`hand_size_value = ${value}`];

  return {
    statement: playSizeCode,
    colour: "G.C.BLUE",
    configVariables,
  };
};
