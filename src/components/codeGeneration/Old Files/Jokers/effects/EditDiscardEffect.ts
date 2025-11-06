import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import type { PassiveEffectResult } from "../effectUtils";
import {
  generateConfigVariables
} from "../gameVariableUtils";

export const generateEditDiscardReturn = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const duration = effect.params?.duration || "permanent";

  const variableName =
    sameTypeCount === 0 ? "discards" : `discards${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName
  )

  const customMessage = effect.customMessage;
  let statement = "";

  let editDiscardCode = "";

  switch (operation) {
    case "add": {
      if (duration === "permanent") {
        editDiscardCode = `
        G.GAME.round_resets.discards = G.GAME.round_resets.discards + ${valueCode}
        ease_discard(${valueCode})
        `;
      } else if (duration === "round") {
        editDiscardCode = `G.GAME.current_round.discards_left = G.GAME.current_round.discards_left + ${valueCode}`;
      }
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Discard"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.ORANGE})
                ${editDiscardCode}
                return true
            end`;
      break;
    }
    case "subtract": {
      if (duration === "permanent") {
        editDiscardCode = `
        G.GAME.round_resets.discards = G.GAME.round_resets.discards - ${valueCode}
        ease_discard(-${valueCode})
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
        ease_discard(${valueCode} - G.GAME.current_round.discards_left)
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
                G.GAME.round_resets.hands = ${
                  duration === "permanent"
                    ? valueCode
                    : "G.GAME.round_resets.hands"
                }
                return true
            end`;
      break;
    }
  }

  return {
    statement,
    colour: "G.C.ORANGE",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };
};

export const generatePassiveDiscard = (effect: Effect): PassiveEffectResult => {
  const operation = effect.params?.operation || "add";
  
  const variableName = "discard_change";
  
  const { valueCode, configVariables, isXVariable } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName
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
};
