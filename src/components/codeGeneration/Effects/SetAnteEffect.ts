import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";
import { generateConfigVariables } from "../lib/gameVariableUtils";

export const generateSetAnteEffectCode = (
  effect: Effect,
  itemType: string,
  triggerType: string,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = (effect.params?.operation?.value as string) || "set";

  const variableName =
    sameTypeCount === 0 ? "ante_value" : `ante_value${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
    variableName,
    itemType
  )

  const customMessage = effect.customMessage ? `"${effect.customMessage}"` : undefined;
  let messageText = "";

  let changeCode = ''
  let modCode = ''
  switch (operation) {
    case "set":
      modCode = `${valueCode} - G.GAME.round_resets.ante`
      changeCode = `${valueCode}`

      if (itemType === "joker") {
        messageText = customMessage || `"Ante set to " .. ${valueCode} .. "!"`
      } else {
        messageText = customMessage ? `"${customMessage}"` :
        `"Ante set to "..tostring(${valueCode})`
      }

      break
    case "subtract":
      modCode = `-${valueCode}`
      changeCode = `G.GAME.round_resets.blind_ante + mod`

      if (itemType === "joker") {
        messageText = customMessage || `"Ante -" .. ${valueCode}`
      } else {
        messageText = customMessage ? `"${customMessage}"` :
        `"-"..tostring(${valueCode}).." Ante"`
      }

      break
    case "add": default:
      modCode = `${valueCode}`
      changeCode = `G.GAME.round_resets.blind_ante + mod`

      if (itemType === "joker") {
        messageText = customMessage || `"Ante +" .. ${valueCode}`
      } else {
        messageText = customMessage ? `"${customMessage}"` :
        `"+"..tostring(${valueCode}).." Ante"`
      }

      break    
  }
  
  changeCode = `G.GAME.round_resets.blind_ante = ${changeCode}`
  
  if (itemType === "consumable") {
    changeCode = `
      ${changeCode}
      card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${messageText}, colour = G.C.YELLOW})`
  }
  let anteCode = ''

  if (itemType === "voucher") {
    anteCode = `
      local mod = ${modCode}
      ease_ante(mod)
      ${changeCode}`
  } else if (itemType === "deck") {
    anteCode = `
      local mod = ${modCode}
        G.E_MANAGER:add_event(Event({
          func = function()
            ease_ante(mod)
            ${changeCode}
            return true
          end,
        }))`
  } else {
    anteCode = `
      local mod = ${modCode}
      ease_ante(mod)
      G.E_MANAGER:add_event(Event({
        func = function()
          ${changeCode}
          return true
        end,
      }))`
  }

  if (itemType === "consumable") {
    anteCode = `
      ${anteCode}
      delay(0.6)`
  }

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  if (itemType === "deck" || itemType === "consumable" || itemType === "voucher" || isScoring) {
    anteCode = `
      __PRE_RETURN_CODE__
      ${anteCode}
      __PRE_RETURN_CODE_END__`
  } else if (itemType === "joker") {
    anteCode = `
      func = function()
        ${anteCode}
        return true
      end`
  }

  if (itemType !== "joker") {
    messageText = ''
  }

  const result: EffectReturn = {
    statement: anteCode,
    message: messageText,
    colour: "G.C.YELLOW",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };

  return result;
}