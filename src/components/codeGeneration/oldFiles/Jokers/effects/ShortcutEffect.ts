import type { PassiveEffectResult } from "../effectUtils";

export const generateShortcutReturn = (
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
};

export const generateShortcutHook = (
  shortcutJokers: Array<{
    jokerKey: string;
    params: Record<string, unknown>;
  }>,
  modPrefix: string
): string => {
  if (shortcutJokers.length === 0) return "";

  let hookCode = `
local smods_shortcut_ref = SMODS.shortcut
function SMODS.shortcut()`;

  shortcutJokers.forEach(({ jokerKey }) => {
    const fullJokerKey = `j_${modPrefix}_${jokerKey}`;

    hookCode += `
    if next(SMODS.find_card("${fullJokerKey}")) then
        return true
    end`;
  });

  hookCode += `
    return smods_shortcut_ref()
end`;

  return hookCode;
};
