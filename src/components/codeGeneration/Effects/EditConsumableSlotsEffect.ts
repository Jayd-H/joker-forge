import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn, PassiveEffectResult } from "../Libs/effectUtils";
import { generateConfigVariables } from "../Libs/gameVariableUtils";

export const generateEditConsumableSlotsPassiveEffectCode = (
  effect: Effect
): PassiveEffectResult => {
  const operation = effect.params?.operation || "add";

  const { valueCode, configVariables, isXVariable } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    "slot_change",
    'joker'
  )

  let addToDeck = "";
  let removeFromDeck = "";

  switch (operation) {
    case "add":
      addToDeck = `G.E_MANAGER:add_event(Event({func = function()
            G.consumeables.config.card_limit = G.consumeables.config.card_limit + ${valueCode}
            return true
        end }))`;
      removeFromDeck = `G.E_MANAGER:add_event(Event({func = function()
            G.consumeables.config.card_limit = G.consumeables.config.card_limit - ${valueCode}
            return true
        end }))`;
      break;
    case "subtract":
      addToDeck = `G.E_MANAGER:add_event(Event({func = function()
            G.consumeables.config.card_limit = math.max(0, G.consumeables.config.card_limit - ${valueCode})
            return true
        end }))`;
      removeFromDeck = `G.E_MANAGER:add_event(Event({func = function()
            G.consumeables.config.card_limit = G.consumeables.config.card_limit + ${valueCode}
            return true
        end }))`;
      break;
    case "set":
      addToDeck = `original_slots = G.consumeables.config.card_limit
        G.E_MANAGER:add_event(Event({func = function()
            G.consumeables.config.card_limit = ${valueCode}
            return true
        end }))`;
      removeFromDeck = `if original_slots then
            G.E_MANAGER:add_event(Event({func = function()
                G.consumeables.config.card_limit = original_slots
                return true
            end }))
        end`;
      break;
    default:
      addToDeck = `G.E_MANAGER:add_event(Event({func = function()
            G.consumeables.config.card_limit = G.consumeables.config.card_limit + ${valueCode}
            return true
        end }))`;
      removeFromDeck = `G.E_MANAGER:add_event(Event({func = function()
            G.consumeables.config.card_limit = G.consumeables.config.card_limit - ${valueCode}
            return true
        end }))`;
  }

  return {
    addToDeck,
    removeFromDeck,
    configVariables: 
      configVariables.length > 0 ?
      configVariables.map((cv)=> `${cv.name} = ${cv.value}`)
      : [],
    locVars:
      isXVariable.isGameVariable || isXVariable.isRangeVariable ? [] : [valueCode],
  };
};


export const generateEditConsumableSlotsEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0,
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect, sameTypeCount)
    case "voucher":
      return generateVoucherCode(effect, sameTypeCount)
    case "deck":
      return generateDeckCode(effect, sameTypeCount)

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
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const variableName =
    sameTypeCount === 0
      ? "consumable_slots"
      : `consumable_slots${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'joker'
  )

  const customMessage = effect.customMessage;
  let statement = "";

  switch (operation) {
    case "add": {
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Consumable Slot"`;
      statement = `func = function()
                G.E_MANAGER:add_event(Event({func = function()
                    G.consumeables.config.card_limit = G.consumeables.config.card_limit + ${valueCode}
                    return true
                end }))
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.GREEN})
                return true
            end`;
      break;
    }
    case "subtract": {
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." Consumable Slot"`;
      statement = `func = function()
                G.E_MANAGER:add_event(Event({func = function()
                    G.consumeables.config.card_limit = math.max(0, G.consumeables.config.card_limit - ${valueCode})
                    return true
                end }))
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
                return true
            end`;
      break;
    }
    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Set to "..tostring(${valueCode}).." Consumable Slots"`;
      statement = `func = function()
                G.E_MANAGER:add_event(Event({func = function()
                    G.consumeables.config.card_limit = ${valueCode}
                    return true
                end }))
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
                return true
            end`;
      break;
    }
    default: {
      const defaultMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Consumable Slot"`;
      statement = `func = function()
                G.E_MANAGER:add_event(Event({func = function()
                    G.consumeables.config.card_limit = G.consumeables.config.card_limit + ${valueCode}
                    return true
                end }))
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${defaultMessage}, colour = G.C.GREEN})
                return true
            end`;
    }
  }

  return {
    statement,
    colour: "G.C.GREEN",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };
};

const generateVoucherCode = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const variableName =
    sameTypeCount === 0 ? "consumable_slots_value" : `consumable_slots_value${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'voucher'
  );

  let addToDeck = "";

    if (operation === "add") {
        addToDeck += `
         G.E_MANAGER:add_event(Event({
            func = function()
        G.consumeables.config.card_limit = G.consumeables.config.card_limit + ${valueCode}
                return true
            end
        }))
        `;
  } else if (operation === "subtract") {
        addToDeck += `
         G.E_MANAGER:add_event(Event({
            func = function()
        G.consumeables.config.card_limit = math.max(0, G.consumeables.config.card_limit - ${valueCode})
                return true
            end
        }))
        `;
  } else if (operation === "set") {
        addToDeck += `
         G.E_MANAGER:add_event(Event({
            func = function()
G.consumeables.config.card_limit = ${valueCode}
                return true
            end
        }))
        `;
  }

  return {
    statement: addToDeck,
    colour: "G.C.BLUE",
    configVariables,
  };
};


const generateDeckCode = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const variableName =
    sameTypeCount === 0 ? "consumable_slots_value" : `consumable_slots_value${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'deck'
  );


  let addToDeck = "";

  if (operation === "add") {
    addToDeck += `
      G.GAME.starting_params.consumable_slots = G.GAME.starting_params.consumable_slots + ${valueCode}`
  } else if (operation === "subtract") {
    addToDeck += `
      G.GAME.starting_params.consumable_slots = G.GAME.starting_params.consumable_slots - ${valueCode}`
  } else if (operation === "set") {
    addToDeck += `
      G.GAME.starting_params.consumable_slots = ${valueCode}`
  }

  return {
    statement: addToDeck,
    colour: "G.C.BLUE",
    configVariables,
  };
};
