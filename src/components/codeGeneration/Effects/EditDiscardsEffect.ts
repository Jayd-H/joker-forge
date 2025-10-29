import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn, PassiveEffectResult } from "../effectUtils";
import { generateConfigVariables } from "../gameVariableUtils";

export const generateEditDiscardsPassiveEffectCode = (
  effect: Effect,
): PassiveEffectResult => {
  const operation = effect.params?.operation || "add";
  
  const variableName = "discard_change";
  
  const { valueCode, configVariables, isXVariable } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'joker'
  )

  let addToDeck = "";
  let removeFromDeck = "";

  switch (operation) {
    case "add":
      addToDeck = `G.GAME.round_resets.discards = G.GAME.round_resets.discards + ${valueCode}`;
      removeFromDeck = `G.GAME.round_resets.discards = G.GAME.round_resets.discards - ${valueCode}`;
      break;
    case "subtract":
      addToDeck = `G.GAME.round_resets.discards = math.max(0, G.GAME.round_resets.discards - ${valueCode})`;
      removeFromDeck = `G.GAME.round_resets.discards = G.GAME.round_resets.discards + ${valueCode}`;
      break;
    case "set":
      addToDeck = `card.ability.extra.original_discards = G.GAME.round_resets.discards
        G.GAME.round_resets.discards = ${valueCode}`;
      removeFromDeck = `if card.ability.extra.original_discards then
            G.GAME.round_resets.discards = card.ability.extra.original_discards
        end`;
      break;
    default:
      addToDeck = `G.GAME.round_resets.discards = G.GAME.round_resets.discards + ${valueCode}`;
      removeFromDeck = `G.GAME.round_resets.discards = G.GAME.round_resets.discards - ${valueCode}`;
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
}

export const generateEditDiscardsEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number,
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect, sameTypeCount)
    case "consumable":
      return generateConsumableCode(effect, sameTypeCount)
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
  const duration = effect.params?.duration || "permanent";

  const variableName =
    sameTypeCount === 0 ? "discards" : `discards${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'joker'
  )

  const customMessage = effect.customMessage;
  let statement = "";

  let editDiscardCode = "";

  switch (operation) {
    case "add": {
      if (duration === "permanent") {
        editDiscardCode = `
        G.GAME.round_resets.discards = G.GAME.round_resets.discards + ${valueCode}
        ease_discards_played(${valueCode})
        `;
      } else if (duration === "round") {
        editDiscardCode = `G.GAME.current_round.discards_left = G.GAME.current_round.discards_left + ${valueCode}`;
      }
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Discard"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.GREEN})
                ${editDiscardCode}
                return true
            end`;
      break;
    }
    case "subtract": {
      if (duration === "permanent") {
        editDiscardCode = `
        G.GAME.round_resets.discards = G.GAME.round_resets.discards - ${valueCode}
        ease_discards_played(-${valueCode})
        `;
      } else if (duration === "round") {
        editDiscardCode = `G.GAME.current_round.discards_left = G.GAME.current_round.discards_left - ${valueCode}`;
      }
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." Discard"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
                ${editDiscardCode}
                return true
            end`;
      break;
    }
    case "set": {
      if (duration === "permanent") {
        editDiscardCode = `
        G.GAME.round_resets.discards = ${valueCode}
        ease_discards_played(${valueCode} - G.GAME.current_round.discards_left)
        `;
      } else if (duration === "round") {
        editDiscardCode = `G.GAME.current_round.discards_left = ${valueCode}`;
      }
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Set to "..tostring(${valueCode}).." Discards"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
                ${editDiscardCode}
                return true
            end`;
      break;
    }
  }

  return {
    statement,
    colour: "G.C.GREEN",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };
};

const generateConsumableCode = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const duration = effect.params?.duration || "permanent";
  const customMessage = effect.customMessage;

  const variableName =
    sameTypeCount === 0 ? "discards_value" : `discards_value${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'consumable'
  );

  let discardsCode = "";
  let editDiscardCode = "";

  switch (operation) {
    case "add": {
      if (duration === "permanent") {
        editDiscardCode = `
        G.GAME.round_resets.discards = G.GAME.round_resets.discards + ${valueCode}
        ease_discards_played(${valueCode})
        `;
      } else if (duration === "round") {
        editDiscardCode = `G.GAME.current_round.discards_left = G.GAME.current_round.discards_left + ${valueCode}`;
      }
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Discard"`;
      discardsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.GREEN})
                    ${editDiscardCode}
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    case "subtract": {
      if (duration === "permanent") {
        editDiscardCode = `
        G.GAME.round_resets.discards = G.GAME.round_resets.discards - ${valueCode}
        ease_discards_played(-${valueCode})
        `;
      } else if (duration === "round") {
        editDiscardCode = `G.GAME.current_round.discards_left = G.GAME.current_round.discards_left - ${valueCode}`;
      }
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." Discard"`;
      discardsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
                    ${editDiscardCode}
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    case "set": {
      if (duration === "permanent") {
        editDiscardCode = `
        G.GAME.round_resets.discards = ${valueCode}
        ease_discards_played(${valueCode} - G.GAME.current_round.discards_left)
        `;
      } else if (duration === "round") {
        editDiscardCode = `G.GAME.current_round.discards_left = ${valueCode}`;
      }
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Set to "..tostring(${valueCode}).." Discards"`;
      discardsCode = `
            __PRE_RETURN_CODE__
            local mod = ${valueCode} - G.GAME.round_resets.discards
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
                    ${editDiscardCode}
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
  }

  return {
    statement: discardsCode,
    colour: "G.C.GREEN",
    configVariables,
  };
};

const generateVoucherCode = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const variableName =
    sameTypeCount === 0 ? "discards_value" : `discards_value${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'voucher'
  );

  let editDiscardCode = "";

  if (operation === "add") {
        editDiscardCode += `
        G.GAME.round_resets.discards = G.GAME.round_resets.discards + ${valueCode}
        ease_discards_played(${valueCode})
        `;
  } else if (operation === "subtract") {
        editDiscardCode += `
        G.GAME.round_resets.discards = G.GAME.round_resets.discards - ${valueCode}
        ease_discards_played(-${valueCode})
        `;
  } else if (operation === "set") {
        editDiscardCode += `
        G.GAME.round_resets.discards = ${valueCode}
        ease_discards_played(${valueCode} - G.GAME.current_round.discards_left)
        `;
  }

  return {
    statement: `__PRE_RETURN_CODE__${editDiscardCode}__PRE_RETURN_CODE_END__`,
    colour: "G.C.GREEN",
    configVariables,
  };
};


const generateDeckCode = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const variableName =
    sameTypeCount === 0 ? "discards_value" : `discards_value${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'deck'
  );

  let editDiscardCode = "";

  if (operation === "add") {
        editDiscardCode += `
        G.GAME.starting_params.discards = G.GAME.starting_params.discards + ${valueCode}
        `;
  } else if (operation === "subtract") {
        editDiscardCode += `
        G.GAME.starting_params.discards = G.GAME.starting_params.discards - ${valueCode}
        `;
  } else if (operation === "set") {
        editDiscardCode += `
        G.GAME.starting_params.discards = ${valueCode}
        `;
  }

  return {
    statement: `__PRE_RETURN_CODE__${editDiscardCode}__PRE_RETURN_CODE_END__`,
    colour: "G.C.GREEN",
    configVariables,
  };
};