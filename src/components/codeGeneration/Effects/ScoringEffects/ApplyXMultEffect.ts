import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../../lib/effectUtils";
import { generateConfigVariables } from "../../lib/gameVariableUtils";

export const generateApplyXMultEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0,
): EffectReturn => {
  const variableName =
    sameTypeCount === 0 ? "Xmult" : `Xmult${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect, 
    'value',
    variableName,
    itemType
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
}