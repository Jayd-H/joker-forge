import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateCopyConsumableReturn = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  const set = (effect.params?.set as string) || "random";
  const specificCard = (effect.params?.specific_card as string) || "random";
  const isNegative = (effect.params?.is_negative as string) === "negative";
  const customMessage = effect.customMessage;

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  let copyCode = "";
  const slotCheck = isNegative
    ? ""
    : "and #G.consumeables.cards + G.GAME.consumeable_buffer < G.consumeables.config.card_limit";
  const bufferCode = isNegative
    ? ""
    : "G.GAME.consumeable_buffer = G.GAME.consumeable_buffer + 1";
  const bufferReset = isNegative ? "" : "G.GAME.consumeable_buffer = 0";
  const negativeSetCode = isNegative
    ? `
                        copied_card:set_edition("e_negative", true)`
    : "";
  const messageText = customMessage
    ? `"${customMessage}"`
    : `"Copied Consumable!"`;

  if (set === "random") {
    copyCode = `
            local target_cards = {}
            for i, consumable in ipairs(G.consumeables.cards) do
                table.insert(target_cards, consumable)
            end
            if #target_cards > 0 ${slotCheck} then
                local card_to_copy = pseudorandom_element(target_cards, pseudoseed('copy_consumable'))
                ${bufferCode}
                G.E_MANAGER:add_event(Event({
                    func = function()
                        local copied_card = copy_card(card_to_copy)${negativeSetCode}
                        copied_card:add_to_deck()
                        G.consumeables:emplace(copied_card)
                        ${bufferReset}
                        return true
                    end
                }))
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${messageText}, colour = G.C.GREEN})
            end`;
  } else {
    if (specificCard === "random") {
      copyCode = `
            local target_cards = {}
            for i, consumable in ipairs(G.consumeables.cards) do
                if consumable.ability.set == "${set}" then
                    table.insert(target_cards, consumable)
                end
            end
            if #target_cards > 0 ${slotCheck} then
                local card_to_copy = pseudorandom_element(target_cards, pseudoseed('copy_consumable'))
                ${bufferCode}
                G.E_MANAGER:add_event(Event({
                    func = function()
                        local copied_card = copy_card(card_to_copy)${negativeSetCode}
                        copied_card:add_to_deck()
                        G.consumeables:emplace(copied_card)
                        ${bufferReset}
                        return true
                    end
                }))
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${messageText}, colour = G.C.GREEN})
            end`;
    } else {
      copyCode = `
            local target_cards = {}
            for i, consumable in ipairs(G.consumeables.cards) do
                if consumable.ability.set == "${set}" and consumable.config.center.key == "${specificCard}" then
                    table.insert(target_cards, consumable)
                end
            end
            if #target_cards > 0 ${slotCheck} then
                local card_to_copy = pseudorandom_element(target_cards, pseudoseed('copy_consumable'))
                ${bufferCode}
                G.E_MANAGER:add_event(Event({
                    func = function()
                        local copied_card = copy_card(card_to_copy)${negativeSetCode}
                        copied_card:add_to_deck()
                        G.consumeables:emplace(copied_card)
                        ${bufferReset}
                        return true
                    end
                }))
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${messageText}, colour = G.C.GREEN})
            end`;
    }
  }

  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__${copyCode}
                __PRE_RETURN_CODE_END__`,
      colour: "G.C.GREEN",
    };
  } else {
    return {
      statement: `func = function()${copyCode}
                    return true
                end`,
      colour: "G.C.GREEN",
    };
  }
};
