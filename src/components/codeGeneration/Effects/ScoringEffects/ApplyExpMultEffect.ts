import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../../Libs/effectUtils";
import { generateConfigVariables } from "../../Libs/gameVariableUtils";

export const generateApplyExpMultEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0,
): EffectReturn => {
  const variableName =
    sameTypeCount === 0 ? "emult" : `emult${sameTypeCount + 1}`;

  const customMessage = effect.customMessage;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
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
