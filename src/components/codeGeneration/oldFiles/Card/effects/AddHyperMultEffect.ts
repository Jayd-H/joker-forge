import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import { generateConfigVariables } from "../../Jokers/gameVariableUtils";

export const generateAddHyperMultReturn = (
  effect: Effect,
  sameTypeCount: number = 0,
  itemType: "enhancement" | "seal" | "edition" = "enhancement"
): EffectReturn => {
  const variableNameN =
    sameTypeCount === 0 ? "hypermult_n" : `hypermult_n${sameTypeCount + 1}`;
  
    const variableNameArrows =
    sameTypeCount === 0 ? "hypermult_arrows" : `hypermult_arrows${sameTypeCount + 1}`;

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
    statement: `hypermult = {
            ${Arrows.valueCode},
            ${N.valueCode}
        }`,
    colour: "G.C.DARK_EDITION",
    configVariables:
      configVariables.length > 0
        ? configVariables.map((cv) => `${cv.name} = ${cv.value}`)
        : undefined,
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
