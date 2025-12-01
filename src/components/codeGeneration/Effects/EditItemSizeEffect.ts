import { JokerData } from "../../data/BalatroUtils";
import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn, PassiveEffectResult } from "../lib/effectUtils";
import { generateConfigVariables } from "../lib/gameVariableUtils";

const generateTypeData = (
  type: string,
) => {
  switch(type) {
    case "voucher_slots":
      return {
        slotsCode: "SMODS.change_voucher_limit",
        differenceCheck: "G.GAME.modifiers.extra_vouchers",
        varName: "voucher_slots",
        seedName: "voucherslots_passive",
        customMessage: "Voucher Slots"
      }
    case "booster_slots":
      return {
        slotsCode: "SMODS.change_booster_limit",
        differenceCheck: "G.GAME.modifiers.extra_boosters",
        varName: "booster_slots",
        seedName: "boosterslots_passive",
        customMessage: "Booster Slots"
      }
    case "shop_slots":
      return {
        slotsCode: "change_shop_size",
        differenceCheck: "G.GAME.modifiers.shop_size",
        varName: "shop_slots",
        seedName: "shopslots_passive",
        customMessage: "Shop Slots"
      }
    case "play_size":
      return {
        slotsCode: "SMODS.change_play_limit",
        differenceCheck: "G.GAME.starting_params.play_limit",
        varName: "play_size",
        seedName: "playsize_passive",
        customMessage: "Play Size"
      }
    case "discard_size":
      return {
        slotsCode: "SMODS.change_discard_limit",
        differenceCheck: "G.GAME.starting_params.discard_limit",
        varName: "discard_size",
        seedName: "discardsize_passive",
        customMessage: "Discard Size"
      }
    case "hand_size":
    default:
      return {
        slotsCode: "G.hand:change_size",
        differenceCheck: "G.hand.config.card_limit",
        varName: "hand_size",
        seedName: "handsize_passive",
        customMessage: "Hand Limit"
      }
  }
}

export const generateEditItemSizePassiveEffectCode = (
  effect: Effect,
  type: string,
  joker?: JokerData,
): PassiveEffectResult => {
  const operation = (effect.params?.operation?.value as string) || "add";
  const itemData = generateTypeData(type)

  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
    `${itemData.varName}_increase`,
    1,
    'joker',
    joker,
  )

  let addToDeck = "";
  let removeFromDeck = "";

  switch (operation) {
    case "add":
      addToDeck = `${itemData.slotsCode}(${valueCode})`;
      removeFromDeck = `${itemData.slotsCode}(-${valueCode})`;
      break;
    case "subtract":
      addToDeck = `${itemData.slotsCode}(-${valueCode})`;
      removeFromDeck = `${itemData.slotsCode}(${valueCode})`;
      break;
    case "set":
      addToDeck = `card.ability.extra.original_${itemData.varName} = ${itemData.differenceCheck} or 0
        local difference = ${valueCode} - ${itemData.differenceCheck}
        ${itemData.slotsCode}(difference)`;
      removeFromDeck = `if card.ability.extra.original_${itemData.varName} then
            local difference = card.ability.extra.original_${itemData.varName} - ${itemData.differenceCheck}
            ${itemData.slotsCode}(difference)
        end`;
      break;
    default:
      addToDeck = `${itemData.slotsCode}(${valueCode})`;
      removeFromDeck = `${itemData.slotsCode}(-${valueCode})`;
  }

  return {
    addToDeck,
    removeFromDeck,
    configVariables,
    locVars: [],
  };
};

export const generateEditItemSizeEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0,
  type: string
): EffectReturn => {
  const operation = effect.params?.operation?.value || "add";
  const itemData = generateTypeData(type)
  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
    itemData.varName,
    sameTypeCount,
    itemType,
  )

  let value = valueCode
  let setCode = ''
  switch (operation){
    case "subtract":
      value = `-${valueCode}`
      break
    case "set":
      value = `difference`
      setCode = `
      local current_${itemData.varName} = (${itemData.differenceCheck} or 0)
      local target_${itemData.varName} = ${valueCode}
      local difference = target_${itemData.varName} - current_${itemData.varName}`
      break
    case "add":
    default:
      value = `${valueCode}`
      break
  }

  const customMessage = 
    effect.customMessage ? `"${effect.customMessage}"` : 
    operation === "set" ? `"${itemData.customMessage} set to "..tostring(${valueCode})` :
    operation === "add" ? `"+"..tostring(${valueCode}).." ${itemData.customMessage}"` : 
    operation === "subtract" ? `"-"..tostring(${valueCode}).." ${itemData.customMessage}"` : ''


  let functionCode = ``
  
  if (itemType === "consumable") {
    functionCode += `__PRE_RETURN_CODE__`
  }
  
  if (itemType === "consumable" || itemType === "voucher" || itemType === "deck") {
    functionCode += `
      G.E_MANAGER:add_event(Event({`
  }

  if (itemType === "consumable") {
    functionCode += `
      trigger = 'after',
      delay = 0.4,`
  }
  const targetCard = 
    itemType === "joker" ? `context.blueprint_card or card` : 
    itemType === "consumable" ? `used_card` : ''

  const evalStatusText = itemType === "joker" || itemType === "consumable"
    ? `card_eval_status_text(${targetCard}, 'extra', nil, nil, nil, {message = ${customMessage}, colour = G.C.BLUE})`
    : ``

  functionCode += `
    func = function()
      ${evalStatusText}
      ${setCode}
      ${itemData.slotsCode}(${value})
      return true
    end`

  if (itemType === "consumable" || itemType === "voucher" || itemType === "deck") {
    functionCode += `
      }))`
  }
  
  if (itemType === "consumable") {
    functionCode += `
    delay(0.6)
__PRE_RETURN_CODE_END__`;
  }

  return {
    statement: functionCode,
    colour: "G.C.WHITE",
    configVariables
  }
}