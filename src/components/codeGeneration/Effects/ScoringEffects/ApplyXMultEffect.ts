import { EditionData, EnhancementData, JokerData, SealData } from "../../../data/BalatroUtils";
import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../../lib/effectUtils";
import { generateConfigVariables } from "../../lib/gameVariableUtils";

export const generateApplyXMultEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0,
  object?: JokerData | EnhancementData | EditionData | SealData
): EffectReturn => {
  const { valueCode, configVariables } = generateConfigVariables(
    effect, 
    'value',
    "xmult",
    sameTypeCount,
    itemType,
    object,
  );
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