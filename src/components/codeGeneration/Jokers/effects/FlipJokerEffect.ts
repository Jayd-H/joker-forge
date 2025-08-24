import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";

export const generateFlipJokerReturn = (
  effect: Effect,
): EffectReturn => {
  const selectionMethod = effect.params?.selection_method as string || "random";
  const position = (effect.params?.position as string) || "first";
  const specificIndex = effect.params?.specific_index as number;
  const customMessage = effect.customMessage;

  let jokerFlipCode = "";
 if (selectionMethod === "all") {
    jokerFlipCode += `if #G.jokers.cards > 0 then
      for _, joker in ipairs(G.jokers.cards) do
        joker:flip()
      end
    end`;
 } else if (selectionMethod === "self") {
    jokerFlipCode += `if #G.jokers.cards > 0 then
    for _, joker in ipairs(G.jokers.cards) do
      if joker == card then
        joker:flip()
        break
      end
    end
    end`;
  } else if (selectionMethod === "random") {
    jokerFlipCode += `if #G.jokers.cards > 0 then
    local available_jokers = {}
      for i, joker in ipairs(G.jokers.cards) do
        table.insert(available_jokers, joker)
      end
      pseudorandom_element(available_jokers, pseudoseed('flip_joker')):flip()
    end`;
  } else if (selectionMethod === "position") {
    switch (position) {
      case "first":
        jokerFlipCode += `if G.jokers.cards[1] then
        G.jokers.cards[1]:flip()
        end`;
        break
      case "last":
        jokerFlipCode += `if G.jokers.cards[#G.jokers.cards] then
        G.jokers.cards[#G.jokers.cards]:flip()
        end`;
        break
      case "left":
        jokerFlipCode += `local self_index = 1
        if #G.jokers.cards > 0 then
          for i = 1, #G.jokers.cards do
            if G.jokers.cards[i] == card then
              self_index = i
              break
            end
          end
          if self_index > 1 then
            G.jokers.cards[self_index - 1]:flip()
          end
        end`;
        break
      case "right":
        jokerFlipCode += `local self_index = 1
        if #G.jokers.cards > 0 then
          for i = 1, #G.jokers.cards do
            if G.jokers.cards[i] == card then
              self_index = i
              break
            end
          end
          if self_index < #G.jokers.cards then
            G.jokers.cards[self_index + 1]:flip()
          end
        end`;
        break
      case "specific":
        jokerFlipCode += `if #G.jokers.cards > 0 then
          if G.jokers.cards[${specificIndex}] then
            G.jokers.cards[${specificIndex}]:flip()
          end
        end`;
        break
    }
  }

  return {
    statement: `__PRE_RETURN_CODE__${jokerFlipCode}__PRE_RETURN_CODE_END__`,
    message: customMessage ?? `"Flip!"`,
    colour: "G.C.ORANGE"
  }
};
