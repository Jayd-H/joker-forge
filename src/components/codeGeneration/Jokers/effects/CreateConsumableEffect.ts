import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import {
  TAROT_CARDS,
  PLANET_CARDS,
  SPECTRAL_CARDS,
} from "../../../data/BalatroUtils";

export const generateCreateConsumableReturn = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  const set = (effect.params?.set as string) || "random";
  const specificCard = (effect.params?.specific_card as string) || "random";
  const isNegative = (effect.params?.is_negative as string) === "negative";
  const customMessage = effect.customMessage;

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  let consumableCreationCode = "";
  let consumableKey = "";
  let setName = "";
  let colour = "G.C.PURPLE";
  let localizeKey = "";

  // Determine the set and card to create
  if (set === "random") {
    if (isNegative) {
      consumableCreationCode = `local created_consumable = true
                G.E_MANAGER:add_event(Event({
                    func = function()
                        local random_sets = {'Tarot', 'Planet', 'Spectral'}
                        local random_set = random_sets[math.random(1, #random_sets)]
                        local consumable_card = create_card(random_set, G.consumeables, nil, nil, nil, nil, nil, 'joker_forge_' .. random_set:lower())
                        consumable_card:set_edition("e_negative", true)
                        consumable_card:add_to_deck()
                        G.consumeables:emplace(consumable_card)
                        return true
                    end
                }))`;
    } else {
      consumableCreationCode = `local created_consumable = false
                if #G.consumeables.cards + G.GAME.consumeable_buffer < G.consumeables.config.card_limit then
                    created_consumable = true
                    G.GAME.consumeable_buffer = G.GAME.consumeable_buffer + 1
                    G.E_MANAGER:add_event(Event({
                        func = function()
                            local random_sets = {'Tarot', 'Planet', 'Spectral'}
                            local random_set = random_sets[math.random(1, #random_sets)]
                            local consumable_card = create_card(random_set, G.consumeables, nil, nil, nil, nil, nil, 'joker_forge_' .. random_set:lower())
                            consumable_card:add_to_deck()
                            G.consumeables:emplace(consumable_card)
                            G.GAME.consumeable_buffer = 0
                            return true
                        end
                    }))
                end`;
    }
    localizeKey = "k_plus_consumable";
  } else {
    // Determine color and localize key based on set
    if (set === "Tarot") {
      colour = "G.C.PURPLE";
      localizeKey = "k_plus_tarot";
      setName = "'Tarot'";
    } else if (set === "Planet") {
      colour = "G.C.SECONDARY_SET.Planet";
      localizeKey = "k_plus_planet";
      setName = "'Planet'";
    } else if (set === "Spectral") {
      colour = "G.C.SECONDARY_SET.Spectral";
      localizeKey = "k_plus_spectral";
      setName = "'Spectral'";
    } else {
      // Custom set
      colour = "G.C.PURPLE";
      localizeKey = "k_plus_consumable";
      setName = `'${set}'`;
    }

    if (specificCard === "random") {
      consumableKey = `nil, nil, nil, nil, nil, 'joker_forge_${set.toLowerCase()}'`;
    } else {
      // Validate the specific card exists in the appropriate set
      let cardExists = false;
      if (set === "Tarot") {
        cardExists = TAROT_CARDS.some((card) => card.key === specificCard);
        consumableKey = cardExists
          ? `nil, nil, nil, nil, '${specificCard}'`
          : `nil, nil, nil, nil, 'c_fool'`;
      } else if (set === "Planet") {
        cardExists = PLANET_CARDS.some((card) => card.key === specificCard);
        consumableKey = cardExists
          ? `nil, nil, nil, nil, '${specificCard}'`
          : `nil, nil, nil, nil, 'c_pluto'`;
      } else if (set === "Spectral") {
        cardExists = SPECTRAL_CARDS.some((card) => card.key === specificCard);
        consumableKey = cardExists
          ? `nil, nil, nil, nil, '${specificCard}'`
          : `nil, nil, nil, nil, 'c_familiar'`;
      } else {
        // Custom consumable
        consumableKey = `nil, nil, nil, nil, '${specificCard}'`;
      }
    }

    if (isNegative) {
      consumableCreationCode = `local created_consumable = true
                G.E_MANAGER:add_event(Event({
                    func = function()
                        local consumable_card = create_card(${setName}, G.consumeables, ${consumableKey})
                        consumable_card:set_edition("e_negative", true)
                        consumable_card:add_to_deck()
                        G.consumeables:emplace(consumable_card)
                        return true
                    end
                }))`;
    } else {
      consumableCreationCode = `local created_consumable = false
                if #G.consumeables.cards + G.GAME.consumeable_buffer < G.consumeables.config.card_limit then
                    created_consumable = true
                    G.GAME.consumeable_buffer = G.GAME.consumeable_buffer + 1
                    G.E_MANAGER:add_event(Event({
                        func = function()
                            local consumable_card = create_card(${setName}, G.consumeables, ${consumableKey})
                            consumable_card:add_to_deck()
                            G.consumeables:emplace(consumable_card)
                            G.GAME.consumeable_buffer = 0
                            return true
                        end
                    }))
                end`;
    }
  }

  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__${consumableCreationCode}
                __PRE_RETURN_CODE_END__`,
      message: customMessage
        ? `"${customMessage}"`
        : `created_consumable and localize('${localizeKey}') or nil`,
      colour: colour,
    };
  } else {
    return {
      statement: `func = function()${consumableCreationCode}
                    if created_consumable then
                        card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${
                          customMessage
                            ? `"${customMessage}"`
                            : `localize('${localizeKey}')`
                        }, colour = ${colour}})
                    end
                    return true
                end`,
      colour: colour,
    };
  }
};
