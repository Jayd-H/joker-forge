import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditHandsReturn = (
  effect: Effect,
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value;

  const valueCode = generateGameVariableCode(value);

  let editHandCode = "";

  if (operation === "add") {
        editHandCode += `
        G.GAME.round_resets.hands = G.GAME.round_resets.hands + ${valueCode}
        ease_hands_played(${valueCode})
        `;
  } else if (operation === "subtract") {
        editHandCode += `
        G.GAME.round_resets.hands = G.GAME.round_resets.hands - ${valueCode}
        ease_hands_played(-${valueCode})
        `;
  } else if (operation === "set") {
        editHandCode += `
        G.GAME.round_resets.hands = ${valueCode}
        ease_hands_played(${valueCode} - G.GAME.current_round.hands_left)
        `;
  }

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`hands_value = ${value}`];

  return {
    statement: `__PRE_RETURN_CODE__${editHandCode}__PRE_RETURN_CODE_END__`,
    colour: "G.C.GREEN",
    configVariables,
  };
};
