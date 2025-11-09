import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditDiscardsReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value;

  const valueCode = generateGameVariableCode(value);

  let editDiscardCode = "";

  if (operation === "add") {
        editDiscardCode += `
        G.GAME.round_resets.discards = G.GAME.round_resets.discards + ${valueCode}
        ease_discard(${valueCode})
        `;
  } else if (operation === "subtract") {
        editDiscardCode += `
        G.GAME.round_resets.discards = G.GAME.round_resets.discards - ${valueCode}
        ease_discard(-${valueCode})
        `;
  } else if (operation === "set") {
        editDiscardCode += `
        G.GAME.round_resets.discards = ${valueCode}
        ease_discard(${valueCode} - G.GAME.current_round.discards_left)
        `;
  }

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`discards_value = ${value}`];

  return {
    statement: `__PRE_RETURN_CODE__${editDiscardCode}__PRE_RETURN_CODE_END__`,
    colour: "G.C.ORANGE",
    configVariables,
  };
};
