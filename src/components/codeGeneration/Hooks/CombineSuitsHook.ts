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
