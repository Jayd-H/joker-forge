import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../../lib/effectUtils";
import { generateConfigVariables } from "../../lib/gameVariableUtils";

export const generateAddChipsEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0,
): EffectReturn => {
  const variableName =
    sameTypeCount === 0 ? "chips" : `chips${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    itemType
  );

  const customMessage = effect.customMessage;

  const result: EffectReturn = {
    statement: `chips = ${valueCode}`,
    colour: "G.C.CHIPS",
    configVariables:
      configVariables.length > 0 ? configVariables : undefined,
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
}