import { JokerData } from "../../../data/BalatroUtils";
import type { Effect } from "../../../ruleBuilder/types";
import type { PassiveEffectResult } from "../effectUtils";
import { parseSuitVariable } from "../variableUtils";

export const generatePassiveCombineSuits = (
  effect: Effect,
  joker?: JokerData,
): PassiveEffectResult => {
  const suit1 = (effect.params?.suit_1 as string) || "Spades";
  const suit2 = (effect.params?.suit_2 as string) || "Hearts";
  const suitVar1 = parseSuitVariable(effect.params?.suit_1 as string, joker)
  const suitVar2 = parseSuitVariable(effect.params?.suit_2 as string, joker)

  const returnSuit1 =  suitVar1.isSuitVariable ? `G.GAME.current_round.${suitVar1.code}_card.suit` : suit1
  const returnSuit2 =  suitVar2.isSuitVariable ? `G.GAME.current_round.${suitVar2.code}_card.suit` : suit2

  return {
    addToDeck: `-- Combine suits effect enabled`,
    removeFromDeck: `-- Combine suits effect disabled`,
    configVariables: [],
    locVars: [],
    needsHook: {
      hookType: "combine_suits",
      jokerKey: joker?.objectKey || "PLACEHOLDER",
      effectParams: {
        returnSuit1,
        returnSuit2,
      },
    },
  };
};

export const generateCombineSuitsHook = (
  combineSuitsJokers: Array<{
    jokerKey: string;
    params: {
      suit1: string;
      suit2: string;
    };
  }>,
  modPrefix: string
): string => {
  if (combineSuitsJokers.length === 0) return "";

  // Group effects by joker key
  const jokerGroups = new Map<
    string,
    Array<{ suit1: string; suit2: string }>
  >();

  combineSuitsJokers.forEach(({ jokerKey, params }) => {
    if (!jokerGroups.has(jokerKey)) {
      jokerGroups.set(jokerKey, []);
    }
    jokerGroups
      .get(jokerKey)!
      .push({ suit1: params.suit1, suit2: params.suit2 });
  });

  let hookCode = `
local card_is_suit_ref = Card.is_suit
function Card:is_suit(suit, bypass_debuff, flush_calc)
    local ret = card_is_suit_ref(self, suit, bypass_debuff, flush_calc)
    if not ret and not SMODS.has_no_suit(self) then`;

  jokerGroups.forEach((effects, jokerKey) => {
    const fullJokerKey = `j_${modPrefix}_${jokerKey}`;

    hookCode += `
        if next(SMODS.find_card("${fullJokerKey}")) then`;

    effects.forEach(({ suit1, suit2 }) => {
      hookCode += `
            -- If checking for ${suit1} and card is ${suit2}, return true
            if suit == "${suit1}" and self.base.suit == "${suit2}" then
                ret = true
            end
            -- If checking for ${suit2} and card is ${suit1}, return true
            if suit == "${suit2}" and self.base.suit == "${suit1}" then
                ret = true
            end`;
    });

    hookCode += `
        end`;
  });

  hookCode += `
    end
    return ret
end`;

  return hookCode;
};
