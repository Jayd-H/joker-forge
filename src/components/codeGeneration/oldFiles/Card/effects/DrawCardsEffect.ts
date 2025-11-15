import type { Effect } from "../../../ruleBuilder/types";
import { generateConfigVariables } from "../../Jokers/gameVariableUtils";
import type { EffectReturn } from "../effectUtils";

export const generateDrawCardsReturn = (
  effect: Effect,
  sameTypeCount: number = 0,
  itemType: "enhancement" | "seal" | "edition" = "enhancement"
): EffectReturn => {
  const variableName =
    sameTypeCount === 0 ? "card_draw" : `card_draw${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    itemType
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
    configVariables:
      configVariables.length > 0
        ? configVariables.map((cv) => `${cv.name} = ${cv.value}`)
        : undefined,
  };

  return result;
};
