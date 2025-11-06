import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../Libs/effectUtils";
import { PLANET_CARD_KEYS, SPECTRAL_CARD_KEYS, TAROT_CARD_KEYS } from "../../data/BalatroUtils";

export const generateCopyConsumableEffectCode = (
  effect: Effect,
  itemType: string,
  triggerType: string,
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect, triggerType)
    case "consumable":
      return generateConsumableCode(effect, triggerType)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateJokerCode = (
  effect: Effect,
  triggerType: string,
): EffectReturn => {
  const consumableType = (effect.params?.consumable_type as string) || "random";
  const specificCard = (effect.params?.specific_card as string) || "random";
  const isNegative = (effect.params?.is_negative as string) === "negative";
  const customMessage = effect.customMessage;

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  let copyCode = "";

  if (consumableType === "random") {
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
    let cardKeys: string[] = [];
    let setName = "";

    if (consumableType === "tarot") {
      setName = "Tarot";
      if (specificCard === "random") {
        cardKeys = Object.values(TAROT_CARD_KEYS);
      } else {
        cardKeys = [specificCard || "c_fool"];
      }
    } else if (consumableType === "planet") {
      setName = "Planet";
      if (specificCard === "random") {
        cardKeys = Object.values(PLANET_CARD_KEYS);
      } else {
        cardKeys = [specificCard || "c_pluto"];
      }
    } else if (consumableType === "spectral") {
      setName = "Spectral";
      if (specificCard === "random") {
        cardKeys = Object.values(SPECTRAL_CARD_KEYS);
      } else {
        cardKeys = [specificCard || "c_familiar"];
      }
    }

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

    if (specificCard === "random") {
      copyCode = `
            local target_cards = {}
            for i, consumable in ipairs(G.consumeables.cards) do
                if consumable.ability.set == "${setName}" then
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
      const targetKey = cardKeys[0];
      copyCode = `
            local target_cards = {}
            for i, consumable in ipairs(G.consumeables.cards) do
                if consumable.ability.set == "${setName}" and consumable.config.center.key == "${targetKey}" then
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

const generateConsumableCode = (
  effect: Effect,
  triggerType: string,
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
}