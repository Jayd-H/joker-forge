import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn, PassiveEffectResult } from "../effectUtils";
import { generateConfigVariables } from "../gameVariableUtils";

export const generateEditHandsPassiveEffectCode = (
  effect: Effect
): PassiveEffectResult => {
  const operation = effect.params?.operation || "add";

  const variableName = "hand_change";
  
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
      addToDeck = `G.GAME.round_resets.hands = G.GAME.round_resets.hands + ${valueCode}`;
      removeFromDeck = `G.GAME.round_resets.hands = G.GAME.round_resets.hands - ${valueCode}`;
      break;
    case "subtract":
      addToDeck = `G.GAME.round_resets.hands = math.max(1, G.GAME.round_resets.hands - ${valueCode})`;
      removeFromDeck = `G.GAME.round_resets.hands = G.GAME.round_resets.hands + ${valueCode}`;
      break;
    case "set":
      addToDeck = `card.ability.extra.original_hands = G.GAME.round_resets.hands
        G.GAME.round_resets.hands = ${valueCode}`;
      removeFromDeck = `if card.ability.extra.original_hands then
            G.GAME.round_resets.hands = card.ability.extra.original_hands
        end`;
      break;
    default:
      addToDeck = `G.GAME.round_resets.hands = G.GAME.round_resets.hands + ${valueCode}`;
      removeFromDeck = `G.GAME.round_resets.hands = G.GAME.round_resets.hands - ${valueCode}`;
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

export const generateEditHandsEffectCode = (
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
    sameTypeCount === 0 ? "hands" : `hands${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'joker'
  )

  const customMessage = effect.customMessage;
  let statement = "";

  let editHandCode = "";

  switch (operation) {
    case "add": {
      if (duration === "permanent") {
        editHandCode = `
        G.GAME.round_resets.hands = G.GAME.round_resets.hands + ${valueCode}
        ease_hands_played(${valueCode})
        `;
      } else if (duration === "round") {
        editHandCode = `G.GAME.current_round.hands_left = G.GAME.current_round.hands_left + ${valueCode}`;
      }
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Hand"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.GREEN})
                ${editHandCode}
                return true
            end`;
      break;
    }
    case "subtract": {
      if (duration === "permanent") {
        editHandCode = `
        G.GAME.round_resets.hands = G.GAME.round_resets.hands - ${valueCode}
        ease_hands_played(-${valueCode})
        `;
      } else if (duration === "round") {
        editHandCode = `G.GAME.current_round.hands_left = G.GAME.current_round.hands_left - ${valueCode}`;
      }
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." Hand"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
                ${editHandCode}
                return true
            end`;
      break;
    }
    case "set": {
      if (duration === "permanent") {
        editHandCode = `
        G.GAME.round_resets.hands = ${valueCode}
        ease_hands_played(${valueCode} - G.GAME.current_round.hands_left)
        `;
      } else if (duration === "round") {
        editHandCode = `G.GAME.current_round.hands_left = ${valueCode}`;
      }
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Set to "..tostring(${valueCode}).." Hands"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
                ${editHandCode}
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
    sameTypeCount === 0 ? "hands_value" : `hands_value${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'consumable'
  );

  let handsCode = "";
  let editHandCode = "";

  switch (operation) {
    case "add": {
      if (duration === "permanent") {
        editHandCode = `
        G.GAME.round_resets.hands = G.GAME.round_resets.hands + ${valueCode}
        ease_hands_played(${valueCode})
        `;
      } else if (duration === "round") {
        editHandCode = `G.GAME.current_round.hands_left = G.GAME.current_round.hands_left + ${valueCode}`;
      }
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Hand"`;
      handsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.GREEN})
                    ${editHandCode}
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    case "subtract": {
      if (duration === "permanent") {
        editHandCode = `
        G.GAME.round_resets.hands = G.GAME.round_resets.hands - ${valueCode}
        ease_hands_played(-${valueCode})
        `;
      } else if (duration === "round") {
        editHandCode = `G.GAME.current_round.hands_left = G.GAME.current_round.hands_left - ${valueCode}`;
      }
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." Hand"`;
      handsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
                    ${editHandCode}
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    case "set": {
      if (duration === "permanent") {
        editHandCode = `
        G.GAME.round_resets.hands = ${valueCode}
        ease_hands_played(${valueCode} - G.GAME.current_round.hands_left)
        `;
      } else if (duration === "round") {
        editHandCode = `G.GAME.current_round.hands_left = ${valueCode}`;
      }
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Set to "..tostring(${valueCode}).." Hands"`;
      handsCode = `
            __PRE_RETURN_CODE__
            local mod = ${valueCode} - G.GAME.round_resets.hands
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
                    ${editHandCode}
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
  }

  return {
    statement: handsCode,
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
    sameTypeCount === 0 ? "hands_value" : `hands_value${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'voucher'
  );

  let editHandCode = "";

  if (operation === "add") {
        editHandCode += `
        G.GAME.round_resets.hands = G.GAME.round_resets.hands + ${valueCode}
        ease_hands_played(${valueCode})
        `;
  } else if (operation === "subtract") {
        editHandCode += `
        G.GAME.round_resets.hands = G.GAME.round_resets.hands - ${valueCode}
        ease_hands_played(-${valueCode})
        `;
  } else if (operation === "set") {
        editHandCode += `
        G.GAME.round_resets.hands = ${valueCode}
        ease_hands_played(${valueCode} - G.GAME.current_round.hands_left)
        `;
  }

  return {
    statement: `__PRE_RETURN_CODE__${editHandCode}__PRE_RETURN_CODE_END__`,
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
    sameTypeCount === 0 ? "hands_value" : `hands_value${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'deck'
  );

  let editHandCode = "";

  if (operation === "add") {
        editHandCode += `
        G.GAME.starting_params.hands = G.GAME.starting_params.hands + ${valueCode}
        `;
  } else if (operation === "subtract") {
        editHandCode += `
        G.GAME.starting_params.hands = G.GAME.starting_params.hands - ${valueCode}
        `;
  } else if (operation === "set") {
        editHandCode += `
        G.GAME.starting_params.hands = ${valueCode}
        `;
  }

  return {
    statement: `__PRE_RETURN_CODE__${editHandCode}__PRE_RETURN_CODE_END__`,
    colour: "G.C.GREEN",
    configVariables,
  };
};