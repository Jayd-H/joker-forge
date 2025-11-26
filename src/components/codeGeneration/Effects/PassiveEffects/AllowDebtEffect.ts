import { JokerData } from "../../../data/BalatroUtils";
import type { Effect } from "../../../ruleBuilder/types";
import type { PassiveEffectResult } from "../../lib/effectUtils";
import { generateConfigVariables } from "../../lib/gameVariableUtils";

export const generateAllowDebtPassiveEffectCode = (
  effect: Effect,
  joker?: JokerData,
): PassiveEffectResult => {
  const { valueCode, configVariables } = generateConfigVariables(
    effect, 
    'value',
    "debt_amount",
    1,
    'joker',
    joker,
  );

  const addToDeck = `G.GAME.bankrupt_at = G.GAME.bankrupt_at - ${valueCode}`;
  const removeFromDeck = `G.GAME.bankrupt_at = G.GAME.bankrupt_at + ${valueCode}`;

  return {
    addToDeck,
    removeFromDeck,
    configVariables,
  };
};
