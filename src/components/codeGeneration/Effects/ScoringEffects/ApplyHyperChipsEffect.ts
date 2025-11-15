import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../../lib/effectUtils";
import { generateConfigVariables } from "../../lib/gameVariableUtils";

export const generateApplyHyperChipsEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0,
): EffectReturn => {
  const variableNameN =
    sameTypeCount === 0 ? "hyperchips_n" : `hyperchips_n${sameTypeCount + 1}`;
  
    const variableNameArrows =
    sameTypeCount === 0 ? "hyperchips_arrows" : `hyperchips_arrows${sameTypeCount + 1}`;

  const N = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableNameN,
    itemType
  )
  
  const Arrows = generateConfigVariables(
    effect.params?.arrows,
    effect.id,
    variableNameArrows,
    itemType
  )

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