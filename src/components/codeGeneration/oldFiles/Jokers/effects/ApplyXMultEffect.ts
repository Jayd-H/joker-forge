import type { Effect } from "../../../ruleBuilder/types";
import {
  generateConfigVariables
} from "../gameVariableUtils";
import type { EffectReturn } from "../effectUtils";

export const generateApplyXMultReturn = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const variableName =
    sameTypeCount === 0 ? "Xmult" : `Xmult${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName
  )

  const customMessage = effect.customMessage;

  const result: EffectReturn = {
    statement: `Xmult = ${valueCode}`,
    colour: "",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
