import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateCopyJokerReturn = (effect: Effect): EffectReturn => {
  const selectionMethod =
    (effect.params?.selection_method as string) || "random";
  const jokerKey = (effect.params?.joker_key as string) || "";
  const position = (effect.params?.position as string) || "first";
  const edition = (effect.params?.edition as string) || "none";
  const customMessage = effect.customMessage;

  const normalizedJokerKey = jokerKey.startsWith("j_") 
  ? jokerKey 
  : `j_${jokerKey}`

  const isNegative = edition === "e_negative";
  const hasEdition = edition !== "none";

  let jokerSelectionCode = "";

  if (selectionMethod === "specific" && normalizedJokerKey) {
    jokerSelectionCode = `
                local target_joker = nil
                for i, joker in ipairs(G.jokers.cards) do
                    if joker.config.center.key == "${normalizedJokerKey}" then
                        target_joker = joker
                        break
                    end
                end`;
  } else if (selectionMethod === "position") {
    if (position === "first") {
      jokerSelectionCode = `
                local target_joker = G.jokers.cards[1] or nil`;
    } else if (position === "last") {
      jokerSelectionCode = `
                local target_joker = G.jokers.cards[#G.jokers.cards] or nil`;
    }
  } else {
    jokerSelectionCode = `
                local available_jokers = {}
                for i, joker in ipairs(G.jokers.cards) do
                    table.insert(available_jokers, joker)
                end
                local target_joker = #available_jokers > 0 and pseudorandom_element(available_jokers, pseudoseed('copy_joker_enhanced')) or nil`;
  }

  let spaceCheckCode = "";
  if (isNegative) {
    spaceCheckCode = `if target_joker then`;
  } else {
    spaceCheckCode = `if target_joker and #G.jokers.cards + G.GAME.joker_buffer < G.jokers.config.card_limit then`;
  }

  const editionCode = hasEdition
    ? `
                        copied_joker:set_edition("${edition}", true)`
    : "";

  const bufferCode = isNegative
    ? ""
    : `
                        G.GAME.joker_buffer = G.GAME.joker_buffer + 1`;

  const bufferReset = isNegative
    ? ""
    : `
                        G.GAME.joker_buffer = 0`;

  const copyCode = `${jokerSelectionCode}
                
                ${spaceCheckCode}${bufferCode}
                    G.E_MANAGER:add_event(Event({
                        func = function()
                            local copied_joker = copy_card(target_joker, nil, nil, nil, target_joker.edition and target_joker.edition.negative)${editionCode}
                            copied_joker:add_to_deck()
                            G.jokers:emplace(copied_joker)${bufferReset}
                            return true
                        end
                    }))
                end`;

  const result: EffectReturn = {
    statement: `__PRE_RETURN_CODE__${copyCode}__PRE_RETURN_CODE_END__`,
    message: customMessage
      ? `"${customMessage}"`
      : `localize('k_duplicated_ex')`,
    colour: "G.C.GREEN",
  };

  return result;
};
