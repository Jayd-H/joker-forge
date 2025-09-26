import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import {
  generateConfigVariables
} from "../gameVariableUtils";

export const generateSetSellValueReturn = (
  effect: Effect,
  triggerType: string,
  sameTypeCount: number = 0
): EffectReturn => {
  const target = (effect.params?.target as string) || "specific";
  const operation: string = (effect.params?.operation as string) || "add";
  const specificTarget = (effect.params?.specific_target as string) || "self";

  const variableName =
    sameTypeCount === 0 ? "sell_value" : `sell_value${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName
  )

  const customMessage = effect.customMessage;

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  let sellValueCode = "";
  let messageText = "";
  let targetJokerLogic = ''

  if (target == "specific") {
    if (specificTarget == "left" || specificTarget == "right" ||specificTarget == "self") {
      targetJokerLogic += `local my_pos = nil
        for i = 1, #G.jokers.cards do
            if G.jokers.cards[i] == card then
                my_pos = i
                break
            end
        end
        local `}
    switch (specificTarget) {
      case "right":
        targetJokerLogic += `target_card = (my_pos and my_pos < #G.jokers.cards) and G.jokers.cards[my_pos + 1] or nil`;
        break;
      case "left":
        targetJokerLogic += `target_card = (my_pos and my_pos > 1) and G.jokers.cards[my_pos - 1] or nil`;
        break;
      case "self":
        targetJokerLogic += `target_card = G.jokers.cards[my_pos]`;
        break;
      case "first":
        targetJokerLogic += `target_card = G.jokers.cards[1]`;
        break
      case "last":
        targetJokerLogic += `target_card = G.jokers.cards[#G.jokers]`;
        break
      case "random":
        targetJokerLogic += `chosenTarget = pseudorandom(${effect.id.substring(0,8)}, 1, #G.jokers.cards) or nil
        target_card = G.jokers.cards[chosenTarget]`;
        break;
    }
    sellValueCode += `${targetJokerLogic}`
  }
  if (target === "all_jokers" || target === "all") {
    sellValueCode += ``
    if (target === "all") {
      sellValueCode += `for _, area in ipairs({ G.jokers, G.consumeables }) do
       `}
    sellValueCode += `for i, target_card in ipairs(`
    if (target === "all_jokers") {
      sellValueCode += `G.jokers.cards`
    }
    else {
      sellValueCode += `area.cards`
    }

    sellValueCode += `) do
                if target_card.set_cost then`
    switch (operation) {
      case "add":
        sellValueCode += `
            target_joker.ability.extra_value = (card.ability.extra_value or 0) + ${valueCode}
            target_joker:set_cost()`;
        break;
      case "subtract":
        sellValueCode += `
            target_joker.ability.extra_value = math.max(0, (card.ability.extra_value or 0) - ${valueCode})
            target_joker:set_cost()`;
        break;
      case "set":
        sellValueCode += `
            target_joker.ability.extra_value = ${valueCode}
            target_joker:set_cost()`;
    }
    if (target === "all_jokers" || target === "all") {
      sellValueCode += `
            end
        end`
      if (target === "all") {
        sellValueCode += `
    end`
      }
    }
  }

  let messageType, messageOperation
  const typeKey: Array<Array<string>> = [["specific", ''], ["all_jokers", 'All Jokers '], ["all", 'All cards ']];
  const operationKey: Array<Array<string>> = [
    ["add", `+"..tostring(${valueCode}).." Sell Value"`],
    ["subtract", `-"..tostring(${valueCode}).." Sell Value"`],
    ["set", `Sell Value: $"..tostring(${valueCode})`]];
  operationKey.forEach(entry => {
    if (entry[0] == operation) { messageOperation = entry[1] }
  })
  typeKey.forEach(entry => {
    if (entry[0] == target) { messageType = entry[1] }
  })

  messageText = customMessage
    ? `"${customMessage}"`
    : `"${messageType}${messageOperation}`

  const result: EffectReturn = {
    statement: isScoring
      ? `__PRE_RETURN_CODE__${sellValueCode}
                __PRE_RETURN_CODE_END__`
      : `func = function()${sellValueCode}
                    return true
                end`,
    message: messageText,
    colour: "G.C.MONEY",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };

  return result;
};
