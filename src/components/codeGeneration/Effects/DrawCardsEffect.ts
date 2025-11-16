import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";
import type { EditionData, EnhancementData, SealData } from "../../data/BalatroUtils";
import { generateConfigVariables, } from "../lib/gameVariableUtils";
import { generateGameVariableCode } from "../lib/gameVariableUtils";

export const generateDrawCardsEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0,
  card?: EnhancementData | EditionData | SealData,
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect, sameTypeCount)
    case "consumable":
      return generateConsumableCode(effect)
    case "card":
      return generateCardCode(effect, sameTypeCount, card)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateJokerCode = (
  effect: Effect,
  sameTypeCount: number = 0,
): EffectReturn => {
  const variableName =
    sameTypeCount === 0 ? "card_draw" : `card_draw${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'joker'
  )

  const customMessage = effect.customMessage;
  const statement = `__PRE_RETURN_CODE__
  if G.GAME.blind.in_blind then
    SMODS.draw_cards(${valueCode})
  end__PRE_RETURN_CODE_END__
  `;
 
  return {
    statement: statement,
    message: customMessage ? `"${customMessage}"` : `"+"..tostring(${valueCode}).." Cards Drawn"`,
    colour: "G.C.BLUE",
    configVariables: configVariables,
  }
};

const generateConsumableCode = (
  effect: Effect,
): EffectReturn => {
  const value = effect.params?.value || 1;
  const customMessage = effect.customMessage;

  const valueCode = generateGameVariableCode(value, '');

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

  return {
    statement: drawCardsCode,
    colour: "G.C.BLUE",
  };
}

const generateCardCode = (
  effect: Effect,
  sameTypeCount: number = 0,
  card?: EditionData | EnhancementData | SealData,
): EffectReturn => {
const variableName =
    sameTypeCount === 0 ? "card_draw" : `card_draw${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    card?.objectType ?? "enhancement"
  );

  const customMessage = effect.customMessage;

  const result: EffectReturn = {
    statement: `__PRE_RETURN_CODE__
  if G.GAME.blind.in_blind then
    SMODS.draw_cards(${valueCode})
  end__PRE_RETURN_CODE_END__`,
    message: customMessage
      ? `"${customMessage}"`
      : `"+"..tostring(${valueCode}).." Cards Drawn"`,
    colour: "G.C.BLUE",
    configVariables
  };

  return result;
}