import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

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
  let colour = "G.C.PURPLE";

  if (set === "random") {
    if (isNegative) {
      consumableCreationCode = `local created_consumable = true
                G.E_MANAGER:add_event(Event({
                    func = function()
                        local random_sets = {'Tarot', 'Planet', 'Spectral'}
                        local random_set = random_sets[math.random(1, #random_sets)]
                        SMODS.add_card{set=random_set, edition = 'e_negative', key_append='enhanced_card_' .. random_set:lower()}
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
                            SMODS.add_card{set=random_set, key_append='enhanced_card_' .. random_set:lower()}
                            G.GAME.consumeable_buffer = 0
                            return true
                        end
                    }))
                end`;
    }
  } else {
    if (set === "Tarot") {
      colour = "G.C.PURPLE";
    } else if (set === "Planet") {
      colour = "G.C.SECONDARY_SET.Planet";
    } else if (set === "Spectral") {
      colour = "G.C.SECONDARY_SET.Spectral";
    } else {
      colour = "G.C.PURPLE";
    }

    if (specificCard === "random") {
      if (isNegative) {
        consumableCreationCode = `local created_consumable = true
                G.E_MANAGER:add_event(Event({
                    func = function()
                        SMODS.add_card{set = '${set}', edition = 'e_negative', key_append = 'enhanced_card_${set.toLowerCase()}'}
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
                            SMODS.add_card{set = '${set}', key_append = 'enhanced_card_${set.toLowerCase()}'}
                            G.GAME.consumeable_buffer = 0
                            return true
                        end
                    }))
                end`;
      }
    } else {
      if (isNegative) {
        consumableCreationCode = `local created_consumable = true
                G.E_MANAGER:add_event(Event({
                    func = function()
                        SMODS.add_card{key = '${specificCard}', edition = 'e_negative', key_append = 'enhanced_card_${set.toLowerCase()}'}
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
                            SMODS.add_card{key = '${specificCard}', key_append = 'enhanced_card_${set.toLowerCase()}'}
                            G.GAME.consumeable_buffer = 0
                            return true
                        end
                    }))
                end`;
      }
    }
  }

  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__${consumableCreationCode}
                __PRE_RETURN_CODE_END__`,
      message: customMessage
        ? `"${customMessage}"`
        : `created_consumable and "+1 Consumable!" or nil`,
      colour: colour,
    };
  } else {
    return {
      statement: `func = function()${consumableCreationCode}
                    if created_consumable then
                        card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${
                          customMessage
                            ? `"${customMessage}"`
                            : `"+1 Consumable!"`
                        }, colour = ${colour}})
                    end
                    return true
                end`,
      colour: colour,
    };
  }
};
