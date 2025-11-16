import type { PassiveEffectResult } from "../effectUtils";

export const generateShowmanReturn = (
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
};

export const generateShowmanHook = (
  showmanJokers: Array<{
    jokerKey: string;
    params: Record<string, unknown>;
  }>,
  modPrefix: string
): string => {
  if (showmanJokers.length === 0) return "";

  let hookCode = `
local smods_showman_ref = SMODS.showman
function SMODS.showman(card_key)`;

  showmanJokers.forEach(({ jokerKey }) => {
    const fullJokerKey = `j_${modPrefix}_${jokerKey}`;

    hookCode += `
    if next(SMODS.find_card("${fullJokerKey}")) then
        return true
    end`;
  });

  hookCode += `
    return smods_showman_ref(card_key)
end`;

  return hookCode;
};
