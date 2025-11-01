import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../../effectUtils";
import { generateConfigVariables } from "../../gameVariableUtils";

export const generateAddMultEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0,
): EffectReturn => {
  const variableName =
    sameTypeCount === 0 ? "mult" : `mult${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    itemType,
  )

  const customMessage = effect.customMessage;

  const result: EffectReturn = {
    statement: `mult = ${valueCode}`,
    colour: "",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
