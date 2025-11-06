import type { Effect } from "../../../ruleBuilder/types";
import {
  generateConfigVariables
} from "../gameVariableUtils";
import type { EffectReturn } from "../effectUtils";

export const generateRetriggerReturn = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {

  const variableName =
    sameTypeCount === 0 ? "repetitions" : `repetitions${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params.repetitions,
    effect.id,
    variableName
  )

  const customMessage = effect.customMessage;
  const messageCode = customMessage
    ? `"${customMessage}"`
    : "localize('k_again_ex')";

  return {
    statement: `repetitions = ${valueCode}`,
    message: messageCode,
    colour: "G.C.RED",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };
};
