import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";

export const generateDestroyJokerReturn = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  const selectionMethod =
    (effect.params?.selection_method as string) || "random";
  const jokerKey = (effect.params?.joker_key as string) || "";
  const position = (effect.params?.position as string) || "first";
  const specificIndex = effect.params?.specific_index as number;
  const customMessage = effect.customMessage;
  const sellValueMultiplier =
    (effect.params?.sell_value_multiplier as number) || 0;
  const variableName = (effect.params?.variable_name as string) || "";
  const bypassEternal = (effect.params?.bypass_eternal as string) === "yes";

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  const normalizedJokerKey = jokerKey.startsWith("j_")
    ? jokerKey
    : `j_${jokerKey}`;

  const eternalCheck = bypassEternal ? "" : " and not joker.ability.eternal";

  let jokerSelectionCode = "";
  let destroyCode = "";

  if (selectionMethod === "specific" && normalizedJokerKey) {
    jokerSelectionCode = `
                local target_joker = nil
                for i, joker in ipairs(G.jokers.cards) do
                    if joker.config.center.key == "${normalizedJokerKey}"${eternalCheck} and not joker.getting_sliced then
                        target_joker = joker
                        break
                    end
                end`;
} else if (selectionMethod === "selected") {
      jokerSelectionCode = `
                local self_card = G.jokers.highlighted[1]
        G.E_MANAGER:add_event(Event({trigger = 'after', delay = 0.4, func = function()
            play_sound('timpani')
            card:juice_up(0.3, 0.5)
            return true end }))
            if joker ~= card${eternalCheck} and not joker.getting_sliced then
        self_card:start_dissolve()
                        break
                    end
                end`;
    } else if (selectionMethod === "position") {
    if (position === "first") {
      jokerSelectionCode = `
                local target_joker = nil
                for i, joker in ipairs(G.jokers.cards) do
                    if joker ~= card${eternalCheck} and not joker.getting_sliced then
                        target_joker = joker
                        break
                    end
                end`;
    } else if (position === "last") {
      jokerSelectionCode = `
                local target_joker = nil
                for i = #G.jokers.cards, 1, -1 do
                    local joker = G.jokers.cards[i]
                    if joker ~= card${eternalCheck} and not joker.getting_sliced then
                        target_joker = joker
                        break
                    end
                end`;
    } else if (position === "left") {
      jokerSelectionCode = `
                local my_pos = nil
                for i = 1, #G.jokers.cards do
                    if G.jokers.cards[i] == card then
                        my_pos = i
                        break
                    end
                end
                local target_joker = nil
                if my_pos and my_pos > 1 then
                    local joker = G.jokers.cards[my_pos - 1]
                    if ${
                      bypassEternal ? "true" : "not joker.ability.eternal"
                    } and not joker.getting_sliced then
                        target_joker = joker
                    end
                end`;
    } else if (position === "right") {
      jokerSelectionCode = `
                local my_pos = nil
                for i = 1, #G.jokers.cards do
                    if G.jokers.cards[i] == card then
                        my_pos = i
                        break
                    end
                end
                local target_joker = nil
                if my_pos and my_pos < #G.jokers.cards then
                    local joker = G.jokers.cards[my_pos + 1]
                    if ${
                      bypassEternal ? "true" : "not joker.ability.eternal"
                    } and not joker.getting_sliced then
                        target_joker = joker
                    end
                end`;
    } else if (position === "specific") {
      jokerSelectionCode = `
                local target_joker = nil
                if G.jokers.cards[${specificIndex}] then
                    local joker = G.jokers.cards[${specificIndex}]
                    if joker ~= card${eternalCheck} and not joker.getting_sliced then
                        target_joker = joker
                    end
                end`;
    }
  } else {
    jokerSelectionCode = `
                local destructable_jokers = {}
                for i, joker in ipairs(G.jokers.cards) do
                    if joker ~= card${eternalCheck} and not joker.getting_sliced then
                        table.insert(destructable_jokers, joker)
                    end
                end
                local target_joker = #destructable_jokers > 0 and pseudorandom_element(destructable_jokers, pseudoseed('destroy_joker')) or nil`;
  }

  let sellValueCode = "";
  if (sellValueMultiplier > 0 && variableName) {
    sellValueCode = `
                    local joker_sell_value = target_joker.sell_cost or 0
                    local sell_value_gain = joker_sell_value * ${sellValueMultiplier}
                    card.ability.extra.${variableName} = card.ability.extra.${variableName} + sell_value_gain`;
  }

  let bypassEternalCode = "";
  if (bypassEternal) {
    bypassEternalCode = `
                    if target_joker.ability.eternal then
                        target_joker.ability.eternal = nil
                    end`;
  }

  destroyCode = `${jokerSelectionCode}
                
                if target_joker then${bypassEternalCode}${sellValueCode}
                    target_joker.getting_sliced = true
                    G.E_MANAGER:add_event(Event({
                        func = function()
                            target_joker:start_dissolve({G.C.RED}, nil, 1.6)
                            return true
                        end
                    }))
                    card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${
                      customMessage ? `"${customMessage}"` : `"Destroyed!"`
                    }, colour = G.C.RED})
                end`;

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
