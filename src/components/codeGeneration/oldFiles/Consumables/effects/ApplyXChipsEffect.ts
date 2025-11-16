import type { Effect } from "../../../ruleBuilder/types";
import { generateGameVariableCode } from "../gameVariableUtils";
import type { EffectReturn } from "../effectUtils";

export const generateApplyXChipsReturn = (
  effect: Effect
): EffectReturn => {
  const value = effect.params?.value || 1.5;

  const valueCode = generateGameVariableCode(value);

  const customMessage = effect.customMessage;

const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`x_chips = ${value}`];

  const result: EffectReturn = {
    statement: `x_chips = ${valueCode}`,
    colour: "G.C.DARK_EDITION",
    configVariables
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
