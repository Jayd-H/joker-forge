import type { Effect } from "../../../ruleBuilder/types";
import { generateGameVariableCode } from "../gameVariableUtils";
import type { EffectReturn } from "../effectUtils";

export const generateApplyExpChipsReturn = (
  effect: Effect,
): EffectReturn => {
  const value = effect.params?.value || 1.1;
  
    const valueCode = generateGameVariableCode(value);
  
    const customMessage = effect.customMessage;
  
  const configVariables =
      typeof value === "string" && value.startsWith("GAMEVAR:")
        ? []
        : [`echips = ${value}`];
  
    const result: EffectReturn = {
      statement: `e_chips = ${valueCode}`,
      colour: "G.C.DARK_EDITION",
      configVariables
    };
  
    if (customMessage) {
      result.message = `"${customMessage}"`;
    }
  
    return result;
  };
