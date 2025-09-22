import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";

export const generateWinBlindReturn = (
  effect: Effect,
): EffectReturn => {
  const customMessage = effect.customMessage;

  const WinBlindCode = `
            G.GAME.chips = G.GAME.blind.chips
            G.STATE = G.STATES.HAND_PLAYED
            G.STATE_COMPLETE = true
            end_round()`;

  return {
    statement: `__PRE_RETURN_CODE__${WinBlindCode}__PRE_RETURN_CODE_END__`,
    message: customMessage ? `"${customMessage}"` : `"Win!"`,
    colour: "G.C.ORANGE"
  }
};
