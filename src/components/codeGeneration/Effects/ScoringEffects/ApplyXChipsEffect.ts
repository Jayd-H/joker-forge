import { EditionData, EnhancementData, JokerData, SealData } from "../../../data/BalatroUtils";
import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../../lib/effectUtils";
import { generateConfigVariables } from "../../lib/gameVariableUtils";

export const generateApplyXChipsEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0,
  object?: JokerData | EnhancementData | EditionData | SealData
): EffectReturn => {
  const { valueCode, configVariables } = generateConfigVariables(
    effect, 
    'value',
    "xchips",
    sameTypeCount,
    itemType,
    object,
  );

  const customMessage = effect.customMessage;

  const result: EffectReturn = {
    statement: `x_chips = ${valueCode}`,
    colour: "G.C.DARK_EDITION",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};