import { JokerData } from "../../data/BalatroUtils";
import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn, PassiveEffectResult } from "../lib/effectUtils";
import { generateConfigVariables, generateValueCode } from "../lib/gameVariableUtils";

export const generateEditItemCountPassiveEffectCode = (
  effect: Effect,
  effectType: string,
  joker?: JokerData
): PassiveEffectResult => {
  const operation = (effect.params?.operation?.value as string) || "add";
  const typeData = generateEffectTypeData(effectType)

  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
    `${typeData.mainCode}_change`,
    1,
    'joker',
    joker,
  )

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
    configVariables,
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
      return generateDeckCode(effect)

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
        function: "ease_discard",
        message: "Discards"
      }
    case "hands":
    default:
      return {
        mainCode: "hands",
        function: "ease_hands_played",
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
  const operation = (effect.params?.operation?.value as string) || "add";
  const duration = (effect.params?.duration?.value as string) || "permanent";

  const typeData = generateEffectTypeData(effectType)

  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
    typeData.mainCode,
    sameTypeCount,
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
          ${typeData.function}(${valueCode})
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
        ${typeData.function}(-${valueCode})
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
        ${typeData.function}(${valueCode} - G.GAME.current_round.${V}_left)
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
        card_eval_status_text(${itemType === "joker" ? 'context.blueprint_card or ' : 'used_'}card, 'extra', nil, nil, nil, {message = ${returnMessage}, colour = ${colour}})
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
): EffectReturn => {
  const operation = (effect.params?.operation?.value as string) || "add";
  const valueCode = generateValueCode(effect.params?.value, 'deck')


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
  };
};