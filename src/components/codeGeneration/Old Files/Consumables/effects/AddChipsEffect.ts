import type { Effect } from "../../../ruleBuilder/types";
import { generateGameVariableCode } from "../gameVariableUtils";
import type { EffectReturn } from "../effectUtils";

export const generateAddChipsReturn = (
  effect: Effect,
): EffectReturn => {
  const value = effect.params?.value || 10;

  const valueCode = generateGameVariableCode(value);

  const customMessage = effect.customMessage;

const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`chips = ${value}`];

  const result: EffectReturn = {
    statement: `chips = ${valueCode}`,
    colour: "G.C.CHIPS",
    configVariables
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
