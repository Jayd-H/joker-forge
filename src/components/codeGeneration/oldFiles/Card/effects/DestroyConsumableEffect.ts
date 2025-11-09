import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateDestroyConsumableReturn = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  const set = (effect.params?.set as string) || "random";
  const specificCard = (effect.params?.specific_card as string) || "random";
  const customMessage = effect.customMessage;

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  let destroyCode = "";
  const messageText = customMessage
    ? `"${customMessage}"`
    : `"Destroyed Consumable!"`;

  if (set === "random") {
    destroyCode = `
            local target_cards = {}
            for i, consumable in ipairs(G.consumeables.cards) do
                table.insert(target_cards, consumable)
            end
            if #target_cards > 0 then
                local card_to_destroy = pseudorandom_element(target_cards, pseudoseed('destroy_consumable'))
                G.E_MANAGER:add_event(Event({
                    func = function()
                        card_to_destroy:start_dissolve()
                        return true
                    end
                }))
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${messageText}, colour = G.C.RED})
            end`;
  } else {
    if (specificCard === "random") {
      destroyCode = `
            local target_cards = {}
            for i, consumable in ipairs(G.consumeables.cards) do
                if consumable.ability.set == "${set}" then
                    table.insert(target_cards, consumable)
                end
            end
            if #target_cards > 0 then
                local card_to_destroy = pseudorandom_element(target_cards, pseudoseed('destroy_consumable'))
                G.E_MANAGER:add_event(Event({
                    func = function()
                        card_to_destroy:start_dissolve()
                        return true
                    end
                }))
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${messageText}, colour = G.C.RED})
            end`;
    } else {
      destroyCode = `
            local target_cards = {}
            for i, consumable in ipairs(G.consumeables.cards) do
                if consumable.ability.set == "${set}" and consumable.config.center.key == "${specificCard}" then
                    table.insert(target_cards, consumable)
                end
            end
            if #target_cards > 0 then
                local card_to_destroy = pseudorandom_element(target_cards, pseudoseed('destroy_consumable'))
                G.E_MANAGER:add_event(Event({
                    func = function()
                        card_to_destroy:start_dissolve()
                        return true
                    end
                }))
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${messageText}, colour = G.C.RED})
            end`;
    }
  }

  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__${destroyCode}
                __PRE_RETURN_CODE_END__`,
      colour: "G.C.RED",
    };
  } else {
    return {
      statement: `func = function()${destroyCode}
                    return true
                end`,
      colour: "G.C.RED",
    };
  }
};
