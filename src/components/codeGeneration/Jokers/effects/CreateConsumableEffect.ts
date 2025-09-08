import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";

export const generateCreateConsumableReturn = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  const set = (effect.params?.set as string) || "random";
  const specificCard = (effect.params?.specific_card as string) || "random";
  const isNegative = (effect.params?.is_negative as string) === "negative";
  const customMessage = effect.customMessage;
  const soulable = effect.params?.soulable;

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
                        SMODS.add_card{set=random_set, edition = 'e_negative', soulable = ${soulable}, key_append='joker_forge_' .. random_set:lower()}
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
                            SMODS.add_card{set=random_set, soulable = ${soulable}, key_append='joker_forge_' .. random_set:lower()}
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
      consumableKey = `nil`;
    } else {
      consumableKey = `'${specificCard}'`;
    }

    if (isNegative) {
      consumableCreationCode = `local created_consumable = true
                G.E_MANAGER:add_event(Event({
                    func = function()
                        SMODS.add_card{set = ${setName}, key = ${consumableKey}, edition = 'e_negative', soulable = ${soulable}, key_append = 'joker_forge_${set.toLowerCase()}'}
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
                            SMODS.add_card{set = ${setName}, soulable = ${soulable}, key = ${consumableKey}, key_append = 'joker_forge_${set.toLowerCase()}'}
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
