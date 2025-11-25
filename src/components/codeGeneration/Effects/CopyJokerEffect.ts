import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";

export const generateCopyJokerEffectCode = (
  effect: Effect,
  itemType: string,
  triggerType: string,
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect, triggerType)
    case "consumable":
      return generateConsumableCode(effect)
    case "card":
      return generateCardCode(effect)

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
    (effect.params?.selection_method?.value as string) || "random";
  const jokerKey = (effect.params?.joker_key?.value as string) || "";
  const position = (effect.params?.position?.value as string) || "first";
  const specificIndex = effect.params?.specific_index?.value as number;
  const edition = (effect.params?.edition?.value as string) || "none";
  const customMessage = effect.customMessage;
  const ignoreSlotsParam = (effect.params?.ignore_slots?.value as string) || "respect"
  const sticker = (effect.params?.sticker?.value as string) || "none"

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  const isNegative = edition === "e_negative";
  const hasEdition = edition !== "none";
  const ignoreSlots = ignoreSlotsParam === "ignore"
  const hasSticker = sticker !== "none";

  let jokerSelectionCode = "";
  let spaceCheckCode = "";
  let copyCode = "";

  const normalizedJokerKey = jokerKey.startsWith("j_") 
  ? jokerKey 
  : `j_${jokerKey}`

  // Generate joker selection logic
  if (selectionMethod === "specific" && normalizedJokerKey) {
    jokerSelectionCode = `
                local target_joker = nil
                for i, joker in ipairs(G.jokers.cards) do
                    if joker.config.center.key == "${normalizedJokerKey}" then
                        target_joker = joker
                        break
                    end
                end`;
  } else if (selectionMethod === "selected_joker") {
    jokerSelectionCode = `
        local _first_materialize = nil
        for i = 1, #G.jokers.highlighted do
                local self_card = G.jokers.highlighted[i]
        G.E_MANAGER:add_event(Event({trigger = 'after', delay = 0.4, func = function()
            play_sound('timpani')
            local copied_joker = copy_card(self_card, set_edition, nil, nil, false)
            copied_joker:start_materialize(nil, _first_materialize)
            self_card:add_to_deck()
            G.jokers:emplace(copied_joker)
            _first_materialize = true
                         return true
                    end
                }))
            end`;
  } else if (selectionMethod === "evaled_joker") {
    jokerSelectionCode = `
        local _first_materialize = nil
        local self_card = context.other_joker
        G.E_MANAGER:add_event(Event({trigger = 'after', delay = 0.4, func = function()
            play_sound('timpani')
            local copied_joker = copy_card(self_card, set_edition, nil, nil, false)
            copied_joker:start_materialize(nil, _first_materialize)
            self_card:add_to_deck()
            G.jokers:emplace(copied_joker)
            _first_materialize = true
                         return true
                    end
                }))`;
  } else if (selectionMethod === "position") {
    if (position === "first") {
      jokerSelectionCode = `
                local target_joker = G.jokers.cards[1] or nil`;
    } else if (position === "last") {
      jokerSelectionCode = `
                local target_joker = G.jokers.cards[#G.jokers.cards] or nil`;
    } else if (position === "left") {
      jokerSelectionCode = `
                local my_pos = nil
                for i = 1, #G.jokers.cards do
                    if G.jokers.cards[i] == card then
                        my_pos = i
                        break
                    end
                end
                local target_joker = (my_pos and my_pos > 1) and G.jokers.cards[my_pos - 1] or nil`;
    } else if (position === "right") {
      jokerSelectionCode = `
                local my_pos = nil
                for i = 1, #G.jokers.cards do
                    if G.jokers.cards[i] == card then
                        my_pos = i
                        break
                    end
                end
                local target_joker = (my_pos and my_pos < #G.jokers.cards) and G.jokers.cards[my_pos + 1] or nil`;
    } else if (position === "specific") {
      jokerSelectionCode = `
                local target_joker = G.jokers.cards[${specificIndex}] or nil`;
    }
  } else if (selectionMethod === "random") {
    jokerSelectionCode = `
                local available_jokers = {}
                for i, joker in ipairs(G.jokers.cards) do
                    table.insert(available_jokers, joker)
                end
                local target_joker = #available_jokers > 0 and pseudorandom_element(available_jokers, pseudoseed('copy_joker')) or nil`;
  }

  // Generate space check logic
  if (isNegative || ignoreSlots) {
    spaceCheckCode = `if target_joker then`;
  } else {
    spaceCheckCode = `if target_joker and #G.jokers.cards + G.GAME.joker_buffer < G.jokers.config.card_limit then`;
  }

  // Generate copy logic
  const editionCode = hasEdition
    ? `
                        copied_joker:set_edition("${edition}", true)`
    : "";
  const stickerCode = hasSticker
    ? `copied_joker:add_sticker('${sticker}', true)`
    : "";
  const bufferCode = isNegative
    ? ""
    : `
                        G.GAME.joker_buffer = G.GAME.joker_buffer + 1`;
  const bufferReset = isNegative
    ? ""
    : `
                        G.GAME.joker_buffer = 0`;

  copyCode = `${jokerSelectionCode}
                
                ${spaceCheckCode}${bufferCode}
                    G.E_MANAGER:add_event(Event({
                        func = function()
                            local copied_joker = copy_card(target_joker, nil, nil, nil, target_joker.edition and target_joker.edition.negative)${editionCode}
                            ${stickerCode}
                            copied_joker:add_to_deck()
                            G.jokers:emplace(copied_joker)${bufferReset}
                            return true
                        end
                    }))
                    card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${
                      customMessage
                        ? `"${customMessage}"`
                        : `localize('k_duplicated_ex')`
                    }, colour = G.C.GREEN})
                end`;

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
): EffectReturn => {
  const selection_method = effect.params?.selection_method?.value as string || "random";
  const amount = effect.params?.amount?.value as string || '1';
  const edition = effect.params?.edition?.value as string || "none";
  const customMessage = effect.customMessage;

  let copyJokerCode = `
            __PRE_RETURN_CODE__
            local jokers_to_copy = {}
            local available_jokers = {}
            
            for _, joker in pairs(G.jokers.cards) do
                if joker.ability.set == 'Joker' then
                    available_jokers[#available_jokers + 1] = joker
                end
            end
            
            if #available_jokers > 0 then
                local temp_jokers = {}
                for _, joker in ipairs(available_jokers) do 
                    temp_jokers[#temp_jokers + 1] = joker 
                end
                
                pseudoshuffle(temp_jokers, 54321)
                
                for i = 1, math.min(card.ability.extra.copy_amount, #temp_jokers, G.jokers.config.card_limit - #G.jokers.cards) do
                    jokers_to_copy[#jokers_to_copy + 1] = temp_jokers[i]
                end
            end

            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    play_sound('timpani')
                    used_card:juice_up(0.3, 0.5)
                    return true
                end
            }))

            local _first_materialize = nil
            for _, joker_to_copy in pairs(jokers_to_copy) do
                G.E_MANAGER:add_event(Event({
                    trigger = 'before',
                    delay = 0.4,
                    func = function()
                        local copied_joker = copy_card(joker_to_copy, nil, nil, nil, false)
                        copied_joker:start_materialize(nil, _first_materialize)
                        copied_joker:add_to_deck()
                        G.jokers:emplace(copied_joker)
                        _first_materialize = true`;
  if (selection_method === "selected") {
  copyJokerCode = `
__PRE_RETURN_CODE__
        local _first_materialize = nil
        for i = 1, #G.jokers.highlighted do
                local self_card = G.jokers.highlighted[i]
        G.E_MANAGER:add_event(Event({trigger = 'after', delay = 0.4, func = function()
            play_sound('timpani')
            local copied_joker = copy_card(self_card, set_edition, nil, nil, false)
            copied_joker:start_materialize(nil, _first_materialize)
            self_card:add_to_deck()
            G.jokers:emplace(copied_joker)
            _first_materialize = true`;
}

  // Handle edition application
  if (edition === "remove") {
    copyJokerCode += `
              copied_joker:set_edition(nil, true)`;
  } else if (edition === "random") {
    copyJokerCode += `
              local edition = poll_edition('copy_joker_edition', nil, true, true, 
                  { 'e_polychrome', 'e_holo', 'e_foil' })
              copied_joker:set_edition(edition, true)`;
  } else if (edition !== "none") {
        copyJokerCode += `
              copied_joker:set_edition('${edition}', true)`;
  }

if (selection_method === "selected") {
copyJokerCode += `
                        return true
                    end
                }))
            end        
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
}
if (selection_method === "random") {
  copyJokerCode += `
                        return true
                    end
                }))
            end
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
}
  const result: EffectReturn = {
    statement: copyJokerCode,
    colour: "G.C.SECONDARY_SET.Spectral",
    configVariables: [
      {name: `copy_amount`, value: amount}
    ],
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};

const generateCardCode = (
  effect: Effect,
): EffectReturn => {
  const selectionMethod =
    (effect.params?.selection_method?.value as string) || "random";
  const jokerKey = (effect.params?.joker_key?.value as string) || "";
  const position = (effect.params?.position?.value as string) || "first";
  const edition = (effect.params?.edition?.value as string) || "none";
  const customMessage = effect.customMessage;

  const normalizedJokerKey = jokerKey.startsWith("j_") 
  ? jokerKey 
  : `j_${jokerKey}`

  const isNegative = edition === "e_negative";
  const hasEdition = edition !== "none";

  let jokerSelectionCode = "";

  if (selectionMethod === "specific" && normalizedJokerKey) {
    jokerSelectionCode = `
                local target_joker = nil
                for i, joker in ipairs(G.jokers.cards) do
                    if joker.config.center.key == "${normalizedJokerKey}" then
                        target_joker = joker
                        break
                    end
                end`;
  } else if (selectionMethod === "position") {
    if (position === "first") {
      jokerSelectionCode = `
                local target_joker = G.jokers.cards[1] or nil`;
    } else if (position === "last") {
      jokerSelectionCode = `
                local target_joker = G.jokers.cards[#G.jokers.cards] or nil`;
    }
  } else {
    jokerSelectionCode = `
                local available_jokers = {}
                for i, joker in ipairs(G.jokers.cards) do
                    table.insert(available_jokers, joker)
                end
                local target_joker = #available_jokers > 0 and pseudorandom_element(available_jokers, pseudoseed('copy_joker_enhanced')) or nil`;
  }

  let spaceCheckCode = "";
  if (isNegative) {
    spaceCheckCode = `if target_joker then`;
  } else {
    spaceCheckCode = `if target_joker and #G.jokers.cards + G.GAME.joker_buffer < G.jokers.config.card_limit then`;
  }

  const editionCode = hasEdition
    ? `
                        copied_joker:set_edition("${edition}", true)`
    : "";

  const bufferCode = isNegative
    ? ""
    : `
                        G.GAME.joker_buffer = G.GAME.joker_buffer + 1`;

  const bufferReset = isNegative
    ? ""
    : `
                        G.GAME.joker_buffer = 0`;

  const copyCode = `${jokerSelectionCode}
                
                ${spaceCheckCode}${bufferCode}
                    G.E_MANAGER:add_event(Event({
                        func = function()
                            local copied_joker = copy_card(target_joker, nil, nil, nil, target_joker.edition and target_joker.edition.negative)${editionCode}
                            copied_joker:add_to_deck()
                            G.jokers:emplace(copied_joker)${bufferReset}
                            return true
                        end
                    }))
                end`;

  const result: EffectReturn = {
    statement: `__PRE_RETURN_CODE__${copyCode}__PRE_RETURN_CODE_END__`,
    message: customMessage
      ? `"${customMessage}"`
      : `localize('k_duplicated_ex')`,
    colour: "G.C.GREEN",
  };

  return result;
}