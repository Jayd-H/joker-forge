import { PassiveEffectResult } from "../effectUtils";

export const generateIgnoreSlotLimitReturn = (
  jokerKey?: string
): PassiveEffectResult => {
  return {
    needsHook: {
      hookType: "ignoreslotlimit",
      jokerKey: jokerKey || "PLACEHOLDER",
      effectParams: {},
    },
  };
};

export const generateIgnoreSlotLimitHook = (
  IgnoreLimitJokers: Array<{
    jokerKey: string;
    params: Record<string, unknown>;
  }>,
  modPrefix: string
): string => {
  if (IgnoreLimitJokers.length === 0) return "";

  let hookCode = `
local check_for_buy_space_ref = G.FUNCS.check_for_buy_space
G.FUNCS.check_for_buy_space = function(card)`;

  IgnoreLimitJokers.forEach(({ jokerKey }) => {
    const fullJokerKey = `j_${modPrefix}_${jokerKey}`;

    hookCode += `
    if card.config.center.key == "${fullJokerKey}" then
        return true
    end`;
  });

  hookCode += `
    return check_for_buy_space_ref()
end`;

  return hookCode;
};