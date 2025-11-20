import type { Effect } from "../../../ruleBuilder/types";
import type { PassiveEffectResult } from "../../lib/effectUtils";

export const generateCopyJokerAbilityPassiveEffectCode = (
  effect: Effect,
): PassiveEffectResult => {
  const selectionMethod =
    (effect.params?.selection_method.value as string) || "right";
  const specificIndex = (effect.params?.specific_index.value as number) || 1;

  let targetJokerLogic = "";

  if (selectionMethod === "right") {
      targetJokerLogic = `local my_pos = nil
        for i = 1, #G.jokers.cards do
            if G.jokers.cards[i] == card then
                my_pos = i
                break
            end
        end
        target_joker = (my_pos and my_pos < #G.jokers.cards) and G.jokers.cards[my_pos + 1] or nil`;
  } else if (selectionMethod === "left") {
      targetJokerLogic = `local my_pos = nil
        for i = 1, #G.jokers.cards do
            if G.jokers.cards[i] == card then
                my_pos = i
                break
            end
        end
        target_joker = (my_pos and my_pos > 1) and G.jokers.cards[my_pos - 1] or nil`;
  } else if (selectionMethod === "last") {
      targetJokerLogic = `target_joker = G.jokers.cards[#G.jokers.cards]`;
  } else if (selectionMethod === "first") {
      targetJokerLogic = `target_joker = G.jokers.cards[1]]`;
  } else if (selectionMethod === "specific") {
      targetJokerLogic = `target_joker = G.jokers.cards[${specificIndex}]`
  } else {
      targetJokerLogic = `local target_key = card.ability.extra.${selectionMethod}
      for i = 1, #G.P_CENTERS do
        if G.P_CENTERS[i].config.center.key == target_key then
          target_joker = G.P_CENTERS[i]
          if target_joker == card then
            target_joker = nil
          end
          break
        end
      end`
  } 
  if (selectionMethod === 'last' || selectionMethod === 'first' || selectionMethod === 'specific') {
    targetJokerLogic = `if target_joker == card then
            target_joker = nil
        end`;
  }

  const calculateFunction = `
        local target_joker = nil
        
        ${targetJokerLogic}
        
        local ret = SMODS.blueprint_effect(card, target_joker, context)
        if ret then
            SMODS.calculate_effect(ret, card)
        end`;

  return {
    calculateFunction,
    configVariables: [],
    locVars: [],
  };
}