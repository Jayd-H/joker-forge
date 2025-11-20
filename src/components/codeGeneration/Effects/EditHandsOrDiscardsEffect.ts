import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn, PassiveEffectResult } from "../lib/effectUtils";
import { generateConfigVariables } from "../lib/gameVariableUtils";

export const generateEditItemCountPassiveEffectCode = (
  effect: Effect,
  effectType: string
): PassiveEffectResult => {
  const operation = effect.params?.operation.value || "add";

  const variableName = "hand_change";
  
  const { valueCode, configVariables, isXVariable } = generateConfigVariables(
    effect,
    'value',
    variableName,
    'joker'
  )
  const typeData = generateEffectTypeData(effectType)

  let addToDeck = "";
  let removeFromDeck = "";
  const V = typeData.mainCode

  switch (operation) {
    case "add":
      addToDeck = `G.GAME.round_resets.${V} = G.GAME.round_resets.${V} + ${valueCode}`;
      removeFromDeck = `G.GAME.round_resets.${V} = G.GAME.round_resets.${V} - ${valueCode}`;
      break;
    case "subtract":
      addToDeck = `G.GAME.round_resets.${V} = math.max(1, G.GAME.round_resets.${V} - ${valueCode})`;
      removeFromDeck = `G.GAME.round_resets.${V} = G.GAME.round_resets.${V} + ${valueCode}`;
      break;
    case "set":
      addToDeck = `card.ability.extra.original_${V} = G.GAME.round_resets.${V}
        G.GAME.round_resets.${V} = ${valueCode}`;
      removeFromDeck = `if card.ability.extra.original_${V} then
            G.GAME.round_resets.${V} = card.ability.extra.original_${V}
        end`;
      break;
    default:
      addToDeck = `G.GAME.round_resets.${V} = G.GAME.round_resets.${V} + ${valueCode}`;
      removeFromDeck = `G.GAME.round_resets.${V} = G.GAME.round_resets.${V} - ${valueCode}`;
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

export const generateEditItemCountEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number,
  effectType: string,
): EffectReturn => {
  switch(itemType) {
    case "joker": 
    case "consumable":
    case "voucher":
      return generateJokerConsumableVoucherCode(effect, itemType, sameTypeCount, effectType)
    case "deck":
      return generateDeckCode(effect, sameTypeCount)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateEffectTypeData = (
  effectType: string,
) => {
  switch (effectType) {
    case "discards":
      return {
        mainCode: "discards",
        message: "Discards"
      }
    case "hands":
    default:
      return {
        mainCode: "hands",
        message: "Hands",
      }
  }
}

const generateJokerConsumableVoucherCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0,
  effectType: string,
): EffectReturn => {
  const operation = effect.params?.operation.value || "add";
  const duration = effect.params?.duration.value || "permanent";

  const typeData = generateEffectTypeData(effectType)

  const variableName =
    sameTypeCount === 0 ? typeData.mainCode : `${typeData.mainCode}${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
    variableName,
    itemType,
  )

  const customMessage = effect.customMessage;

  let statement = "";
  let editHandCode = "";
  let returnMessage = "";
  let colour = "";
  const V = typeData.mainCode

  switch (operation) {
    case "add": {
      if (duration === "permanent") {
        editHandCode = `
          G.GAME.round_resets.${V} = G.GAME.round_resets.${V} + ${valueCode}
          ease_${V}_played(${valueCode})
        `;
      } else if (duration === "round") {
        editHandCode = `
          G.GAME.current_round.${V}_left = G.GAME.current_round.${V}_left + ${valueCode}`;
      }
      returnMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." ${typeData.message}"`;
      colour = 'G.C.GREEN'
      break
    }
    case "subtract": {
      if (duration === "permanent") {
        editHandCode = `
        G.GAME.round_resets.${V} = G.GAME.round_resets.${V} - ${valueCode}
        ease_${V}_played(-${valueCode})
        `;
      } else if (duration === "round") {
        editHandCode = `G.GAME.current_round.${V}_left = G.GAME.current_round.${V}_left - ${valueCode}`;
      }
      returnMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." ${typeData.message}"`;
      colour = 'G.C.RED'
      break;
    }
    case "set": {
      if (duration === "permanent") {
        editHandCode = `
        G.GAME.round_resets.${V} = ${valueCode}
        ease_${V}_played(${valueCode} - G.GAME.current_round.${V}_left)
        `;
      } else if (duration === "round") {
        editHandCode = `G.GAME.current_round.${V}_left = ${valueCode}`;
      }
      returnMessage = customMessage
        ? `"${customMessage}"`
        : `"Set to "..tostring(${valueCode}).." ${typeData.message}"`;
      colour = 'G.C.BLUE'
      break;
    }
  }

  if (itemType === "joker" || itemType === "consumable") {
    statement = `
      func = function()
        card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${returnMessage}, colour = ${colour}})
        ${editHandCode}
        return true
      end`;
  } else {
    statement = `
      ${editHandCode}`
  }

  if (itemType === "consumable") {
    statement = `
      G.E_MANAGER:add_event(Event({
          trigger = 'after',
          delay = 0.4,
          ${statement}
      }))
      delay(0.6)`;
    if (operation === "set") {
      statement = `
      local mod = ${valueCode} - G.GAME.round_resets.${typeData.mainCode}
      ${statement}`
    }
  }

  if (itemType === "voucher" || itemType === "consumable") {
    statement =  `
      __PRE_RETURN_CODE__
      ${statement}
      __PRE_RETURN_CODE_END__`
  }

  return {
    statement,
    colour: "G.C.GREEN",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };
};

const generateDeckCode = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = effect.params?.operation.value || "add";
  const variableName =
    sameTypeCount === 0 ? "hands_value" : `hands_value${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
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