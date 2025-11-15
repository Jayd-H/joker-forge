//! DEPRECIATED FILE

import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import { TAROT_CARDS } from "../../../data/BalatroUtils";

export const generateAddTarotCardReturn = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  const tarotCard = (effect.params?.tarot_card as string) || "random";
  const isNegative = (effect.params?.is_negative as string) === "negative";
  const customMessage = effect.customMessage;

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  let tarotCreationCode = "";
  let tarotKey = "";

  if (tarotCard === "random") {
    tarotKey = "nil, nil, nil, nil, nil, 'joker_forge_tarot'";
  } else {
    // Check if the tarotCard exists in TAROT_CARDS, otherwise fallback to c_fool
    const tarotCardData = TAROT_CARDS.find((card) => card.key === tarotCard);
    const specificKey = tarotCardData ? tarotCard : "c_fool";
    tarotKey = `nil, nil, nil, nil, '${specificKey}'`;
  }

  if (isNegative) {
    tarotCreationCode = `local created_tarot = true
                G.E_MANAGER:add_event(Event({
                    func = function()
                        local tarot_card = create_card('Tarot', G.consumeables, ${tarotKey})
                        tarot_card:set_edition("e_negative", true)
                        tarot_card:add_to_deck()
                        G.consumeables:emplace(tarot_card)
                        return true
                    end
                }))`;
  } else {
    tarotCreationCode = `local created_tarot = false
                if #G.consumeables.cards + G.GAME.consumeable_buffer < G.consumeables.config.card_limit then
                    created_tarot = true
                    G.GAME.consumeable_buffer = G.GAME.consumeable_buffer + 1
                    G.E_MANAGER:add_event(Event({
                        func = function()
                            local tarot_card = create_card('Tarot', G.consumeables, ${tarotKey})
                            tarot_card:add_to_deck()
                            G.consumeables:emplace(tarot_card)
                            G.GAME.consumeable_buffer = 0
                            return true
                        end
                    }))
                end`;
  }

  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__${tarotCreationCode}
                __PRE_RETURN_CODE_END__`,
      message: customMessage
        ? `"${customMessage}"`
        : `created_tarot and localize('k_plus_tarot') or nil`,
      colour: "G.C.PURPLE",
    };
  } else {
    return {
      statement: `func = function()${tarotCreationCode}
                    if created_tarot then
                        card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${
                          customMessage
                            ? `"${customMessage}"`
                            : `localize('k_plus_tarot')`
                        }, colour = G.C.PURPLE})
                    end
                    return true
                end`,
      colour: "G.C.PURPLE",
    };
  }
};
