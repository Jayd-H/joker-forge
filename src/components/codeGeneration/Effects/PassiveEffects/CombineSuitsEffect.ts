import type { Effect } from "../../../ruleBuilder/types";
import type { PassiveEffectResult } from "../../lib/effectUtils";


export const generateCombineSuitsPassiveEffectCode = (
  effect: Effect,
  jokerKey: string,
): PassiveEffectResult => {
  const suit1 = (effect.params?.suit_1?.value as string) || "Spades";
  const suit2 = (effect.params?.suit_2?.value as string) || "Hearts";

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