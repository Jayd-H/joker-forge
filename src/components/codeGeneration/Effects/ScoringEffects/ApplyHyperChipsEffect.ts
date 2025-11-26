import { EditionData, EnhancementData, JokerData, SealData } from "../../../data/BalatroUtils";
import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../../lib/effectUtils";
import { generateConfigVariables } from "../../lib/gameVariableUtils";

export const generateApplyHyperChipsEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0,
  object?: JokerData | EnhancementData | EditionData | SealData
): EffectReturn => {
  const N = generateConfigVariables(
    effect, 
    'value',
    "hyperchips_n",
    sameTypeCount,
    itemType,
    object,
  ); 
  const Arrows = generateConfigVariables(
    effect, 
    'arrows',
    "hyperchips_arrows",
    sameTypeCount,
    itemType,
    object,
  );

  const customMessage = effect.customMessage;

  const configVariables = [...N.configVariables, ...Arrows.configVariables]

  const result: EffectReturn = {
    statement: `hyperchips = {
    ${Arrows.valueCode},
    ${N.valueCode}
}`,
    colour: "G.C.DARK_EDITION",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
}