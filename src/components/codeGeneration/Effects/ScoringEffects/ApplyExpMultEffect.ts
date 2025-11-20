import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../../lib/effectUtils";
import { generateConfigVariables } from "../../lib/gameVariableUtils";

export const generateApplyExpMultEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0,
): EffectReturn => {
  const variableName =
    sameTypeCount === 0 ? "emult" : `emult${sameTypeCount + 1}`;

  const customMessage = effect.customMessage;

  const { valueCode, configVariables } = generateConfigVariables(
    effect, 
    'value',
    variableName,
    itemType
  )

  const result: EffectReturn = {
    statement: `e_mult = ${valueCode}`,
    colour: "G.C.DARK_EDITION",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
