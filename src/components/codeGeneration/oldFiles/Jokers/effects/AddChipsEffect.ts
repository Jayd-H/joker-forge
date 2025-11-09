import type { Effect } from "../../../ruleBuilder/types";
import {
  generateConfigVariables
} from "../gameVariableUtils";
import type { EffectReturn } from "../effectUtils";

export const generateAddChipsReturn = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const variableName =
    sameTypeCount === 0 ? "chips" : `chips${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName
  )

  const customMessage = effect.customMessage;

  const result: EffectReturn = {
    statement: `chips = ${valueCode}`,
    colour: "G.C.CHIPS",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
