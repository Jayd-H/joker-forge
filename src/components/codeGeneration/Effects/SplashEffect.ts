import type { PassiveEffectResult } from "../effectUtils";

export const generateSplashPassiveEffectCode = (
): PassiveEffectResult => {
  const calculateFunction = `
        if context.modify_scoring_hand and not context.blueprint then
            return {
                add_to_hand = true
            }
        end`;

  return {
    calculateFunction,
    configVariables: [],
    locVars: [],
  };
};