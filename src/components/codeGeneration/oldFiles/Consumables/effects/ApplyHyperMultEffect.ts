import type { Effect } from "../../../ruleBuilder/types";
import { generateGameVariableCode } from "../gameVariableUtils";
import type { EffectReturn } from "../effectUtils";

export const generateApplyHyperMultReturn = (
  effect: Effect,
): EffectReturn => {
  const N = effect.params?.value || 1.1;
  const Arrows = effect.params?.arrows || 1;

  const NCode = generateGameVariableCode(N); 
  const ArrowsCode = generateGameVariableCode(Arrows); 

  const customMessage = effect.customMessage;

const configVariables =
      typeof N === "string" && N.startsWith("GAMEVAR:")
        ? []
        : [`hypermult_n = ${N}`];
        typeof Arrows === "string" && Arrows.startsWith("GAMEVAR:")
        ? []
        : [`hypermult_arrows = ${Arrows}`];

  const result: EffectReturn = {
    statement: `hypermult = {
    ${Arrows}.${ArrowsCode},
    ${N}.${NCode}
}`,
    colour: "G.C.DARK_EDITION",
    configVariables,
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
