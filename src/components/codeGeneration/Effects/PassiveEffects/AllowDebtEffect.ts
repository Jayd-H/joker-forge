import type { Effect } from "../../../ruleBuilder/types";
import type { PassiveEffectResult } from "../../lib/effectUtils";
import { generateConfigVariables } from "../../lib/gameVariableUtils";

export const generateAllowDebtPassiveEffectCode = (
  effect: Effect,
): PassiveEffectResult => {
  const variableName = "debt_amount";

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'joker'
  )

  const addToDeck = `G.GAME.bankrupt_at = G.GAME.bankrupt_at - ${valueCode}`;
  const removeFromDeck = `G.GAME.bankrupt_at = G.GAME.bankrupt_at + ${valueCode}`;

  return {
    addToDeck,
    removeFromDeck,
    configVariables:
      configVariables.length > 0
        ? configVariables.map((cv) => cv.name + " = " + cv.value)
        : [],
  };
};
