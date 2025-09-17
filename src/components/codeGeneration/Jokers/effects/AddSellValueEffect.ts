import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import {
  generateConfigVariables,
} from "../gameVariableUtils";

export const generateAddSellValueReturn = (
  effect: Effect,
  triggerType: string,
  sameTypeCount: number = 0
): EffectReturn => {
  const target = (effect.params?.target as string) || "specific";
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
  let targetJokerLogic = ''

  if (target == "specific") {
    if (specificTarget == "left"||"right"||"self"){
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
      targetJokerLogic += `target_joker = (my_pos and my_pos < #G.jokers.cards) and G.jokers.cards[my_pos + 1] or nil`;
      break;
    case "left":
      targetJokerLogic += `target_joker = (my_pos and my_pos > 1) and G.jokers.cards[my_pos - 1] or nil`;
      break;
    case "self":
      targetJokerLogic += `target_joker = G.jokers.cards[my_post]`;
      break;
    case "first":
      targetJokerLogic += `target_joker = G.jokers.cards[1]`;
      break
    case "last":
      targetJokerLogic += `target_joker = G.jokers.cards[#G.jokers]`;
      break
    case "random":
      targetJokerLogic += `chosenTarget = pseudorandom(3456543, 1, #G.jokers.cards) or nil
        target_joker = G.jokers.cards[chosenTarget]
        end`;
      break;}
    sellValueCode += `${targetJokerLogic}
            target_joker.ability.extra_value = (card.ability.extra_value or 0) + ${valueCode}
            target_joker:set_cost()`;}
  else if (target === "all_jokers") {
    sellValueCode += `
            for i, other_card in ipairs(G.jokers.cards) do
                if other_card.set_cost then
                    other_card.ability.extra_value = (other_card.ability.extra_value) + ${valueCode}
                    other_card:set_cost()
                end
            end`;
  } else if (target === "all") {
    sellValueCode += `
            for _, area in ipairs({ G.jokers, G.consumeables }) do
                for i, other_card in ipairs(area.cards) do
                    if other_card.set_cost then
                        other_card.ability.extra_value = (other_card.ability.extra_value) + ${valueCode}
                        other_card:set_cost()
                    end
                end
            end`;
  }

  const result: EffectReturn = {
    statement: isScoring
      ? `__PRE_RETURN_CODE__${sellValueCode}
                __PRE_RETURN_CODE_END__`
      : `func = function()${sellValueCode}
                    return true
                end`,
    message: customMessage ? `"${customMessage}"` : `localize('k_val_up')`,
    colour: "G.C.MONEY",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };

  return result;
};
