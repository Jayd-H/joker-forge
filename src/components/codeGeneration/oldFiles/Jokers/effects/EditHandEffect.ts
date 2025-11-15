import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import type { PassiveEffectResult } from "../effectUtils";
import {
  generateConfigVariables
} from "../gameVariableUtils";

export const generateEditHandReturn = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const duration = effect.params?.duration || "permanent";

  const variableName =
    sameTypeCount === 0 ? "hands" : `hands${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName
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

export const generatePassiveHand = (effect: Effect): PassiveEffectResult => {
  const operation = effect.params?.operation || "add";

  const variableName = "hand_change";
  
  const { valueCode, configVariables, isXVariable } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName
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
