import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateConfigVariables } from "../gameVariableUtils";

export const generateDestroyJokerEffectCode = (
  effect: Effect,
  itemType: string,
  triggerType: string, 
  sameTypeCount: number = 0
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect, triggerType)
    case "consumable":
      return generateConsumableCode(effect, sameTypeCount)

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

  const eternalCheck = bypassEternal ? "" : " and not SMODS.is_eternal(joker)";

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
                      bypassEternal ? "true" : "not SMODS.is_eternal(joker)"
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
                      bypassEternal ? "true" : "not SMODS.is_eternal(joker)"
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


const generateConsumableCode = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const selection_method = effect.params?.selection_method || "random";
  const variableName =
    sameTypeCount === 0 ? "destroy_count" : `destroy_count${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.amount ?? 1,
    effect.id,
    variableName,
    'consumable',
  )      
  const customMessage = effect.customMessage;

  let destroyJokerCode = `
            __PRE_RETURN_CODE__
            local jokers_to_destroy = {}
            local deletable_jokers = {}
            
            for _, joker in pairs(G.jokers.cards) do
                if joker.ability.set == 'Joker' and not SMODS.is_eternal(joker, card) then
                    deletable_jokers[#deletable_jokers + 1] = joker
                end
            end
            
            if #deletable_jokers > 0 then
                local temp_jokers = {}
                for _, joker in ipairs(deletable_jokers) do 
                    temp_jokers[#temp_jokers + 1] = joker 
                end
                
                pseudoshuffle(temp_jokers, 98765)
                
                for i = 1, math.min(${valueCode}, #temp_jokers) do
                    jokers_to_destroy[#jokers_to_destroy + 1] = temp_jokers[i]
                end
            end

            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    play_sound('tarot1')
                    used_card:juice_up(0.3, 0.5)
                    return true
                end
            }))

            local _first_dissolve = nil
            G.E_MANAGER:add_event(Event({
                trigger = 'before',
                delay = 0.75,
                func = function()
                    for _, joker in pairs(jokers_to_destroy) do
                        joker:start_dissolve(nil, _first_dissolve)
                        _first_dissolve = true
                    end
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;

  if (selection_method === "selected") {
    destroyJokerCode = `
           __PRE_RETURN_CODE__
        local self_card = G.jokers.highlighted[1]
        G.E_MANAGER:add_event(Event({trigger = 'after', delay = 0.4, func = function()
            play_sound('timpani')
            card:juice_up(0.3, 0.5)
            return true end }))
        self_card:start_dissolve()
        delay(0.6)
    __PRE_RETURN_CODE_END__`;
}
    
  const result: EffectReturn = {
    statement: destroyJokerCode,
    colour: "G.C.RED",
    configVariables,
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
}