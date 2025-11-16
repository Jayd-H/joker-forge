import type { Effect } from "../../../ruleBuilder/types";
import { generateGameVariableCode } from "../gameVariableUtils";
import type { EffectReturn } from "../effectUtils";

export const generateAddMultReturn = (
  effect: Effect,
): EffectReturn => {
  const value = effect.params?.value || 5;

  const valueCode = generateGameVariableCode(value);

  const customMessage = effect.customMessage;

const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`mult = ${value}`];

  const result: EffectReturn = {
    statement: `mult = ${valueCode}`,
    colour: "G.C.CHIPS",
    configVariables
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
