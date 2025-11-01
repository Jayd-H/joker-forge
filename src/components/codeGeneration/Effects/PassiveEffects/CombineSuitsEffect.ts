import type { Effect } from "../../../ruleBuilder/types";
import type { PassiveEffectResult } from "../../effectUtils";


export const generateCombineSuitsPassiveEffectCode = (
  effect: Effect,
  jokerKey: string,
): PassiveEffectResult => {
  const suit1 = (effect.params?.suit_1 as string) || "Spades";
  const suit2 = (effect.params?.suit_2 as string) || "Hearts";

  return {
    addToDeck: `-- Combine suits effect enabled`,
    removeFromDeck: `-- Combine suits effect disabled`,
    configVariables: [],
    locVars: [],
    needsHook: {
      hookType: "combine_suits",
      jokerKey: jokerKey,
      effectParams: {
        suit1,
        suit2,
      },
    },
  };
}