import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

// Mapping of tarot card names to their Balatro keys THESE MAY BE WRONG?
const TAROT_CARD_KEYS: Record<string, string> = {
  the_fool: "c_fool",
  the_magician: "c_magician",
  the_high_priestess: "c_high_priestess",
  the_empress: "c_empress",
  the_emperor: "c_emperor",
  the_hierophant: "c_hierophant",
  the_lovers: "c_lovers",
  the_chariot: "c_chariot",
  justice: "c_justice",
  the_hermit: "c_hermit",
  the_wheel_of_fortune: "c_wheel_of_fortune",
  strength: "c_strength",
  the_hanged_man: "c_hanged_man",
  death: "c_death",
  temperance: "c_temperance",
  the_devil: "c_devil",
  the_tower: "c_tower",
  the_star: "c_star",
  the_moon: "c_moon",
  the_sun: "c_sun",
  judgement: "c_judgement",
  the_world: "c_world",
};

export const generateAddTarotCardReturn = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  const tarotCard = (effect.params?.tarot_card as string) || "random";

  // Define scoring triggers that need the pre-return code approach
  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  // Generate the tarot card creation code
  let tarotCreationCode = "";

  if (tarotCard === "random") {
    // Create a random tarot card using SMODS.add_card
    tarotCreationCode = `
            -- Create random tarot card
            if #G.consumeables.cards + G.GAME.consumeable_buffer < G.consumeables.config.card_limit then
                G.GAME.consumeable_buffer = G.GAME.consumeable_buffer + 1
                G.E_MANAGER:add_event(Event({
                    func = function()
                        SMODS.add_card {
                            set = 'Tarot',
                            key_append = 'joker_forge_tarot'
                        }
                        G.GAME.consumeable_buffer = 0
                        return true
                    end
                }))
            end`;
  } else {
    // Create a specific tarot card
    const tarotKey = TAROT_CARD_KEYS[tarotCard] || "c_fool";
    tarotCreationCode = `
            -- Create specific tarot card: ${tarotCard}
            if #G.consumeables.cards + G.GAME.consumeable_buffer < G.consumeables.config.card_limit then
                G.GAME.consumeable_buffer = G.GAME.consumeable_buffer + 1
                G.E_MANAGER:add_event(Event({
                    func = function()
                        local tarot_card = create_card('Tarot', G.consumeables, nil, nil, nil, nil, '${tarotKey}')
                        tarot_card:add_to_deck()
                        G.consumeables:emplace(tarot_card)
                        G.GAME.consumeable_buffer = 0
                        return true
                    end
                }))
            end`;
  }

  if (isScoring) {
    // For scoring triggers, use pre-return code
    return {
      statement: `__PRE_RETURN_CODE__${tarotCreationCode}
                __PRE_RETURN_CODE_END__`,
      message: `localize('k_plus_tarot')`,
      colour: "G.C.PURPLE",
    };
  } else {
    // For non-scoring triggers, use func approach
    return {
      statement: `func = function()${tarotCreationCode}
                    card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = localize('k_plus_tarot'), colour = G.C.PURPLE})
                    return true
                end`,
      colour: "G.C.PURPLE",
    };
  }
};
