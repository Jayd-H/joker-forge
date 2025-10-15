import type { Effect } from "../../../ruleBuilder/types";
import { generateGameVariableCode } from "../gameVariableUtils";
import type { EffectReturn } from "../effectUtils";

export const generateApplyExpMultReturn = (
  effect: Effect,
): EffectReturn => {
  const value = effect.params?.value || 1.1;
  
    const valueCode = generateGameVariableCode(value);
  
    const customMessage = effect.customMessage;
  
  const configVariables =
      typeof value === "string" && value.startsWith("GAMEVAR:")
        ? []
        : [`emult = ${value}`];
  
    const result: EffectReturn = {
      statement: `e_mult = ${valueCode}`,
      colour: "G.C.DARK_EDITION",
      configVariables
    };
  
    if (customMessage) {
      result.message = `"${customMessage}"`;
    }
  
    return result;
  };
