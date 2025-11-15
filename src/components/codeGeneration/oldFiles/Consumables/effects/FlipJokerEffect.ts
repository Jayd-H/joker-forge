import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";

export const generateFlipJokerReturn = (
  effect: Effect,
): EffectReturn => {
  const selectionMethod = effect.params?.selection_method as string || "random";
  const customMessage = effect.customMessage;

  let jokerFlipCode = "";
 if (selectionMethod === "all") {
    jokerFlipCode += `if #G.jokers.cards > 0 then
      for _, joker in ipairs(G.jokers.cards) do
        joker:flip(stay_flipped)
      end
    end`;
 } else if (selectionMethod === "selected") {
    jokerFlipCode += `if #G.jokers.cards > 0 then
for i = 1, #G.jokers.highlighted do
          G.jokers.highlighted[i]:flip()
        break
     end
    end`;
  } else if (selectionMethod === "random") {
    jokerFlipCode += `if #G.jokers.cards > 0 then
    local available_jokers = {}
      for i, joker in ipairs(G.jokers.cards) do
        table.insert(available_jokers, joker)
      end
      pseudorandom_element(available_jokers, pseudoseed('flip_joker')):flip(stay_flipped)
    end`;
  } 
  

  return {
    statement: `__PRE_RETURN_CODE__${jokerFlipCode}__PRE_RETURN_CODE_END__`,
    message: customMessage ? `"${customMessage}"` : `"Flip!"`,
    colour: "G.C.ORANGE"
  }
};
