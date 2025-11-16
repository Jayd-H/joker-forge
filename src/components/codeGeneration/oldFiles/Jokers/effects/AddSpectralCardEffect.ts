//! DEPRECIATED FILE

import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import { SPECTRAL_CARDS } from "../../../data/BalatroUtils";

export const generateAddSpectralCardReturn = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  const spectralCard = (effect.params?.spectral_card as string) || "random";
  const isNegative = (effect.params?.is_negative as string) === "negative";
  const customMessage = effect.customMessage;

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  let spectralCreationCode = "";

  if (spectralCard === "random") {
    if (isNegative) {
      spectralCreationCode = `local created_spectral = true
                G.E_MANAGER:add_event(Event({
                    func = function()
                        local spectral_card = create_card('Spectral', G.consumeables, nil, nil, nil, nil, nil, 'joker_forge_spectral')
                        spectral_card:set_edition("e_negative", true)
                        spectral_card:add_to_deck()
                        G.consumeables:emplace(spectral_card)
                        return true
                    end
                }))`;
    } else {
      spectralCreationCode = `local created_spectral = false
                if #G.consumeables.cards + G.GAME.consumeable_buffer < G.consumeables.config.card_limit then
                    created_spectral = true
                    G.GAME.consumeable_buffer = G.GAME.consumeable_buffer + 1
                    G.E_MANAGER:add_event(Event({
                        func = function()
                            local spectral_card = create_card('Spectral', G.consumeables, nil, nil, nil, nil, nil, 'joker_forge_spectral')
                            spectral_card:add_to_deck()
                            G.consumeables:emplace(spectral_card)
                            G.GAME.consumeable_buffer = 0
                            return true
                        end
                    }))
                end`;
    }
  } else {
    // Check if the spectralCard exists in SPECTRAL_CARDS, otherwise fallback to c_familiar
    const spectralCardData = SPECTRAL_CARDS.find(
      (card) => card.key === spectralCard
    );
    const spectralKey = spectralCardData ? spectralCard : "c_familiar";

    if (isNegative) {
      spectralCreationCode = `local created_spectral = true
                G.E_MANAGER:add_event(Event({
                    func = function()
                        local spectral_card = create_card('Spectral', G.consumeables, nil, nil, nil, nil, '${spectralKey}')
                        spectral_card:set_edition("e_negative", true)
                        spectral_card:add_to_deck()
                        G.consumeables:emplace(spectral_card)
                        return true
                    end
                }))`;
    } else {
      spectralCreationCode = `local created_spectral = false
                if #G.consumeables.cards + G.GAME.consumeable_buffer < G.consumeables.config.card_limit then
                    created_spectral = true
                    G.GAME.consumeable_buffer = G.GAME.consumeable_buffer + 1
                    G.E_MANAGER:add_event(Event({
                        func = function()
                            local spectral_card = create_card('Spectral', G.consumeables, nil, nil, nil, nil, '${spectralKey}')
                            spectral_card:add_to_deck()
                            G.consumeables:emplace(spectral_card)
                            G.GAME.consumeable_buffer = 0
                            return true
                        end
                    }))
                end`;
    }
  }

  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__${spectralCreationCode}
                __PRE_RETURN_CODE_END__`,
      message: customMessage
        ? `"${customMessage}"`
        : `created_spectral and localize('k_plus_spectral') or nil`,
      colour: "G.C.SECONDARY_SET.Spectral",
    };
  } else {
    return {
      statement: `func = function()${spectralCreationCode}
                    if created_spectral then
                        card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${
                          customMessage
                            ? `"${customMessage}"`
                            : `localize('k_plus_spectral')`
                        }, colour = G.C.SECONDARY_SET.Spectral})
                    end
                    return true
                end`,
      colour: "G.C.SECONDARY_SET.Spectral",
    };
  }
};
