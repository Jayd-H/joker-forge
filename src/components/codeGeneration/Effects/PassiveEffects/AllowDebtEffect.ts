import type { Effect } from "../../../ruleBuilder/types";
import type { PassiveEffectResult } from "../../lib/effectUtils";
import { generateConfigVariables } from "../../lib/gameVariableUtils";

export const generateAllowDebtPassiveEffectCode = (
  effect: Effect,
): PassiveEffectResult => {
  const variableName = "debt_amount";

  const { valueCode, configVariables } = generateConfigVariables(
    effect, 
    'value',
    variableName,
    'joker'
  )

  const addToDeck = `G.GAME.bankrupt_at = G.GAME.bankrupt_at - ${valueCode}`;
  const removeFromDeck = `G.GAME.bankrupt_at = G.GAME.bankrupt_at + ${valueCode}`;

  return {
    addToDeck,
    removeFromDeck,
    configVariables,
  };
};
