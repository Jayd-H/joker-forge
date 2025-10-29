import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateConfigVariables } from "../gameVariableUtils";

export const generateEditShopCardSlotsEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = effect.params?.operation || "add";

  const variableName =
    sameTypeCount === 0 ? "shop_slots" : `shop_slots${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    itemType
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
      local current_shop_slots = (G.GAME.modifiers.shop_size or 0)
      local target_shop_slots = ${valueCode}
      local difference = target_shop_slots - current_shop_slots`
      break
    case "add":
    default:
      value = `${valueCode}`
      break
  }

  const customMessage = effect.customMessage;
  const addMessage = customMessage
    ? `"${customMessage}"`
    : `"+"..tostring(${valueCode}).." Shop Slots"`;
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
      delay = 0.4,
      func = function()`
  }

  const evalStatusText = itemType === "joker" || itemType === "consumable"
    ? `card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.BLUE})`
    : ``

  functionCode += `
    func = function()
      ${evalStatusText}
      ${setCode}
      SMODS.change_shop_size(${value})
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