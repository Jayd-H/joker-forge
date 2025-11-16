import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateDrawCardsReturn = (effect: Effect): EffectReturn => {
  const value = effect.params?.value || 1;
  const customMessage = effect.customMessage;

  const valueCode = generateGameVariableCode(value);

  const defaultMessage = customMessage
  ? `"${customMessage}"`
  : `"+"..tostring(${valueCode}).." Cards Drawn"`;
  
  const drawCardsCode = `
      __PRE_RETURN_CODE__
      if G.GAME.blind.in_blind then
        G.E_MANAGER:add_event(Event({
            trigger = 'after',
            delay = 0.4,
            func = function()
                card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${defaultMessage}, colour = G.C.BLUE})
                SMODS.draw_cards(${valueCode})
                return true
            end
        }))
        delay(0.6)
      end
      __PRE_RETURN_CODE_END__`;

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`hand_size_value = ${value}`];

  return {
    statement: drawCardsCode,
    colour: "G.C.BLUE",
    configVariables,
  };
};
