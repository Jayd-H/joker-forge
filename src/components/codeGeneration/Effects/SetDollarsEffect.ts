import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";
import { generateConfigVariables} from "../lib/gameVariableUtils";

export const generateSetDollarsEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0,
): EffectReturn => {
  const operation = effect.params?.operation as string || "add";
  const limitTypes = effect.params?.limit_dollars as boolean[] || [false, false, false, false]
  const minEarnings = effect.params?.min_earnings as number || 0
  const maxEarnings = effect.params?.max_earnings as number || 0
  const minTotal = effect.params?.min_total as number || 0
  const maxTotal = effect.params?.max_total as number || 0

  const customMessage = effect.customMessage;

  const variableName =
    sameTypeCount === 0 ? "dollars" : `dollars${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    itemType
  )

  let targetCode = ''
  let dollarsCode = `dollar_value`
  let operationSymbol = '+'
  switch (operation) {
    case "subtract":
      targetCode = `G.GAME.dollars - ${valueCode}`
      operationSymbol = '-'
      break
    case "multiply":
      targetCode = `G.GAME.dollars * ${valueCode}`
      operationSymbol = 'X'
      break
    case "divide":
      targetCode = `G.GAME.dollars / ${valueCode}`
      operationSymbol = '/'
      break
    case "set":
      targetCode = `${valueCode}`
      operationSymbol = 'Set to $'
      break
    case "add":
      targetCode = `G.GAME.dollars + ${valueCode}`
  }

  if (limitTypes[2]) {
    targetCode = `math.max(${targetCode}, ${minTotal})`
  }
  if (limitTypes[3]) {
    targetCode = `math.min(${targetCode}, ${maxTotal})`
  }

  if (limitTypes[0]) {
    dollarsCode = `math.max(${dollarsCode}, ${minEarnings})`
  }
  if (limitTypes[1]) {
    dollarsCode = `math.min(${dollarsCode}, ${maxEarnings})`
  }

  if (itemType === "consumable" || itemType === "voucher") {
    dollarsCode = `ease_dollars(${dollarsCode}, true)`
  } else {
    dollarsCode = `ease_dollars(${dollarsCode})`
  }

  const changeCode = `
    local current_dollars = G.GAME.dollars
    local target_dollars = ${targetCode}
    local dollar_value = target_dollars - current_dollars`
  
  if (itemType === "consumable") {
    const message = customMessage
    ? `"${customMessage}"`
    : `"${operationSymbol}"..tostring(${valueCode}).." $"`;
    return {
      statement: `__PRE_RETURN_CODE__
        G.E_MANAGER:add_event(Event({
            trigger = 'after',
            delay = 0.4,
            func = function()
                ${changeCode}
                card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${message}, colour = G.C.RED})
                ${dollarsCode}
                return true
            end
        }))
        delay(0.6)
        __PRE_RETURN_CODE_END__`,
      colour: "G.C.MONEY",
      configVariables
    };
  } else {
    const setMessage = customMessage
        ? `"${customMessage}"`
        : `"${operationSymbol}"..tostring(${valueCode})`;
    return {
      statement: `
        func = function()
          ${changeCode}
          ${dollarsCode}
          card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.MONEY})
          return true
        end`,
      colour: "G.C.MONEY",
      configVariables
    }
  }
}