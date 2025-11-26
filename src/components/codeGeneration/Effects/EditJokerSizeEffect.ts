import { JokerData } from "../../data/BalatroUtils";
import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn, PassiveEffectResult } from "../lib/effectUtils";
import { generateConfigVariables, generateValueCode } from "../lib/gameVariableUtils";

export const generateEditJokerSizePassiveEffectCode = (
  effect: Effect,
  joker?: JokerData,
): PassiveEffectResult => {
  const operation = (effect.params?.operation?.value as string) || "add";

  const valueCode = generateValueCode(effect.params?.value, 'joker', joker)

  let addToDeck = "";
  let removeFromDeck = "";

  switch (operation) {
    case "add":
      addToDeck = `G.jokers.config.highlighted_limit =G.jokers.config.highlighted_limit + ${valueCode}`;
      removeFromDeck = `G.jokers.config.highlighted_limit =G.jokers.config.highlighted_limit - ${valueCode}`;
      break;
    case "subtract":
      addToDeck = `G.jokers.config.highlighted_limit = math.max(1,G.jokers.config.highlighted_limit - ${valueCode})`;
      removeFromDeck = `G.jokers.config.highlighted_limit =G.jokers.config.highlighted_limit + ${valueCode}`;
      break;
    case "set":
      addToDeck = `card.ability.extra.original_joker_size =G.jokers.config.highlighted_limit
       G.jokers.config.highlighted_limit = ${valueCode}`;
      removeFromDeck = `if card.ability.extra.original_joker_slots then
           G.jokers.config.highlighted_limit = card.ability.extra.original_joker_slots
        end`;
      break;
    default:
      addToDeck = `G.jokers.config.highlighted_limit =G.jokers.config.highlighted_limit + ${valueCode}`;
      removeFromDeck = `G.jokers.config.highlighted_limit =G.jokers.config.highlighted_limit - ${valueCode}`;
  }

  return {
    addToDeck,
    removeFromDeck,
    configVariables: [],
    locVars: [],
  };
};



export const generateEditJokerSizeEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0,
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect, sameTypeCount)
    case "consumable":
      return generateConsumableCode(effect)
    case "voucher":
      return generateVoucherCode(effect)
    case "deck":
      return generateDeckCode(effect)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateJokerCode = (
  effect: Effect,
  sameTypeCount: number = 0,
  joker?: JokerData
): EffectReturn => {
  const operation = (effect.params?.operation?.value as string) || "add";
  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
    "joker_size",
    sameTypeCount,
    'joker',
    joker
  )

  const customMessage = effect.customMessage;
  let statement = "";

  switch (operation) {
    case "add": {
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Joker Size"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.DARK_EDITION})
               G.jokers.config.highlighted_limit =G.jokers.config.highlighted_limit + ${valueCode}
                return true
            end`;
      break;
    }
    case "subtract": {
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." Joker Size"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
               G.jokers.config.highlighted_limit = math.max(1,G.jokers.config.highlighted_limit - ${valueCode})
                return true
            end`;
      break;
    }
    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Joker Sizes set to "..tostring(${valueCode})`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
               G.jokers.config.highlighted_limit = ${valueCode}
                return true
            end`;
      break;
    }
    default: {
      const defaultMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Joker Size"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${defaultMessage}, colour = G.C.DARK_EDITION})
               G.jokers.config.highlighted_limit =G.jokers.config.highlighted_limit + ${valueCode}
                return true
            end`;
    }
  }

  return {
    statement,
    colour: "G.C.DARK_EDITION",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };
};

const generateConsumableCode = (
  effect: Effect,
): EffectReturn => {
  const operation = (effect.params?.operation?.value as string) || "add";
  const customMessage = effect.customMessage;

  const valueCode = generateValueCode(effect.params?.value, 'consumable')

  let jokerSlotsCode = "";

  switch (operation) {
    case "add": {
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Joker Size"`;
      jokerSlotsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.DARK_EDITION})
                   G.jokers.config.highlighted_limit =G.jokers.config.highlighted_limit + ${valueCode}
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    case "subtract": {
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." Joker Size"`;
      jokerSlotsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
                   G.jokers.config.highlighted_limit = math.max(1,G.jokers.config.highlighted_limit - ${valueCode})
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Joker Sizes set to "..tostring(${valueCode})`;
      jokerSlotsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
                   G.jokers.config.highlighted_limit = ${valueCode}
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    default: {
      const defaultMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Joker Size"`;
      jokerSlotsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${defaultMessage}, colour = G.C.DARK_EDITION})
                   G.jokers.config.highlighted_limit =G.jokers.config.highlighted_limit + ${valueCode}
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
    }
  }

  return {
    statement: jokerSlotsCode,
    colour: "G.C.DARK_EDITION",
  };
};

const generateVoucherCode = (
  effect: Effect,
): EffectReturn => {
  const operation = (effect.params?.operation?.value as string) || "add";
  const valueCode = generateValueCode(effect.params?.value, 'voucher')

  let jokerSlotsCode = "";

    if (operation === "add") {
        jokerSlotsCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
       G.jokers.config.highlighted_limit =G.jokers.config.highlighted_limit + ${valueCode}
                return true
            end
        }))
        `;
  } else if (operation === "subtract") {
        jokerSlotsCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
       G.jokers.config.highlighted_limit = math.max(1,G.jokers.config.highlighted_limit - ${valueCode})
                return true
            end
        }))
        `;
  } else if (operation === "set") {
        jokerSlotsCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
G.jokers.config.highlighted_limit = ${valueCode}
                return true
            end
        }))
        `;
  }

  return {
    statement: jokerSlotsCode,
    colour: "G.C.DARK_EDITION",
  };
};

const generateDeckCode = (
  effect: Effect,
): EffectReturn => {
  const operation = (effect.params?.operation?.value as string) || "add";
  const valueCode = generateValueCode(effect.params?.value, 'deck')

  let jokerSlotsCode = "";

    if (operation === "add") {
        jokerSlotsCode += `
        G.GAME.starting_params.joker_slots = G.GAME.starting_params.joker_slots + ${valueCode}
        `;
  } else if (operation === "subtract") {
        jokerSlotsCode += `
        G.GAME.starting_params.joker_slots = G.GAME.starting_params.joker_slots - ${valueCode}
        `;
  } else if (operation === "set") {
        jokerSlotsCode += `
   G.GAME.starting_params.joker_slots = ${valueCode}
        `;
  }

  return {
    statement: jokerSlotsCode,
    colour: "G.C.DARK_EDITION",
  };
}