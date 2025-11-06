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
        G.GAME.starting_params.hands = G.GAME.starting_params.hands + ${valueCode}
        `;
  } else if (operation === "subtract") {
        editHandCode += `
        G.GAME.starting_params.hands = G.GAME.starting_params.hands - ${valueCode}
        `;
  } else if (operation === "set") {
        editHandCode += `
        G.GAME.starting_params.hands = ${valueCode}
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
