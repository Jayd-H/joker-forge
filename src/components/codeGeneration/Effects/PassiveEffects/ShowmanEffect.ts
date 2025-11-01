import type { PassiveEffectResult } from "../../effectUtils";

export const generateShowmanPassiveEffectCode = (
  jokerKey?: string
): PassiveEffectResult => {
  return {
    addToDeck: `-- Showman effect enabled (allow duplicate cards)`,
    removeFromDeck: `-- Showman effect disabled`,
    configVariables: [],
    locVars: [],
    needsHook: {
      hookType: "showman",
      jokerKey: jokerKey || "PLACEHOLDER",
      effectParams: {},
    },
  };
}