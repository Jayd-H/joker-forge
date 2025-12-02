import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";
import type { EditionData, EnhancementData, SealData } from "../../data/BalatroUtils";
import { generateConfigVariables, generateValueCode, } from "../lib/gameVariableUtils";

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
  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
    "card_draw",
    sameTypeCount,
    'joker'
  )

  const customMessage = effect.customMessage;
  const statement = `
    __PRE_RETURN_CODE__
    if G.hand and #G.hand.cards > 0 then
      SMODS.draw_cards(${valueCode})
    end
    __PRE_RETURN_CODE_END__`;
 
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

  const valueCode = generateValueCode(value, 'consumable');

  const defaultMessage = customMessage
  ? `"${customMessage}"`
  : `"+"..tostring(${valueCode}).." Cards Drawn"`;
  
  const drawCardsCode = `
    __PRE_RETURN_CODE__
    if G.hand and #G.hand.cards > 0 then
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
  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
    "card_draw",
    sameTypeCount,
    card?.objectType ?? "enhancement",
    card,
  );

  const customMessage = effect.customMessage;

  const result: EffectReturn = {
    statement: `
      __PRE_RETURN_CODE__
        if G.hand and #G.hand.cards > 0 then
          SMODS.draw_cards(${valueCode})
        end
      __PRE_RETURN_CODE_END__`,
    message: customMessage
      ? `"${customMessage}"`
      : `"+"..tostring(${valueCode}).." Cards Drawn"`,
    colour: "G.C.BLUE",
    configVariables
  };

  return result;
}