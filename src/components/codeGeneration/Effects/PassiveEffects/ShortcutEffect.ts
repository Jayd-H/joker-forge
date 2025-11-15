import type { PassiveEffectResult } from "../../lib/effectUtils";


export const generateShortcutPassiveEffectCode = (
  jokerKey?: string
): PassiveEffectResult => {
  return {
    addToDeck: `-- Shortcut straights enabled`,
    removeFromDeck: `-- Shortcut straights disabled`,
    configVariables: [],
    locVars: [],
    needsHook: {
      hookType: "shortcut",
      jokerKey: jokerKey || "PLACEHOLDER",
      effectParams: {},
    },
  };
}