import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateDestroyJokerReturn = (effect: Effect): EffectReturn => {
  const selectionMethod =
    (effect.params?.selection_method as string) || "random";
  const jokerKey = (effect.params?.joker_key as string) || "";
  const position = (effect.params?.position as string) || "first";
  const customMessage = effect.customMessage;

  const normalizedJokerKey = jokerKey.startsWith("j_") 
  ? jokerKey 
  : `j_${jokerKey}`

  let jokerSelectionCode = "";

  if (selectionMethod === "specific" && normalizedJokerKey) {
    jokerSelectionCode = `
                local target_joker = nil
                for i, joker in ipairs(G.jokers.cards) do
                    if joker.config.center.key == "${normalizedJokerKey}" and not joker.ability.eternal and not joker.getting_sliced then
                        target_joker = joker
                        break
                    end
                end`;
  } else if (selectionMethod === "position") {
    if (position === "first") {
      jokerSelectionCode = `
                local target_joker = nil
                for i, joker in ipairs(G.jokers.cards) do
                    if not joker.ability.eternal and not joker.getting_sliced then
                        target_joker = joker
                        break
                    end
                end`;
    } else if (position === "last") {
      jokerSelectionCode = `
                local target_joker = nil
                for i = #G.jokers.cards, 1, -1 do
                    local joker = G.jokers.cards[i]
                    if not joker.ability.eternal and not joker.getting_sliced then
                        target_joker = joker
                        break
                    end
                end`;
    }
  } else {
    jokerSelectionCode = `
                local destructable_jokers = {}
                for i, joker in ipairs(G.jokers.cards) do
                    if not joker.ability.eternal and not joker.getting_sliced then
                        table.insert(destructable_jokers, joker)
                    end
                end
                local target_joker = #destructable_jokers > 0 and pseudorandom_element(destructable_jokers, pseudoseed('destroy_joker_enhanced')) or nil`;
  }

  const destroyCode = `${jokerSelectionCode}
                
                if target_joker then
                    target_joker.getting_sliced = true
                    G.E_MANAGER:add_event(Event({
                        func = function()
                            target_joker:start_dissolve({G.C.RED}, nil, 1.6)
                            return true
                        end
                    }))
                end`;

  const result: EffectReturn = {
    statement: `__PRE_RETURN_CODE__${destroyCode}__PRE_RETURN_CODE_END__`,
    message: customMessage ? `"${customMessage}"` : `"Destroyed Joker!"`,
    colour: "G.C.RED",
  };

  return result;
};
