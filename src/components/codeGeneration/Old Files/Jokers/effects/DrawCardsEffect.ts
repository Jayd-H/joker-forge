import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import {
  generateConfigVariables
} from "../gameVariableUtils";

export const generateDrawCardsReturn = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const variableName =
    sameTypeCount === 0 ? "card_draw" : `card_draw${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName
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
}