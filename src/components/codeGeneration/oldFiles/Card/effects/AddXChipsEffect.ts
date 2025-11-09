import type { Effect } from "../../../ruleBuilder/types";
import { generateConfigVariables } from "../../Jokers/gameVariableUtils";
import type { EffectReturn } from "../effectUtils";

export const generateAddXChipsReturn = (
  effect: Effect,
  sameTypeCount: number = 0,
  itemType: "enhancement" | "seal" | "edition" = "enhancement"
): EffectReturn => {
  const variableName =
    sameTypeCount === 0 ? "x_chips" : `x_chips${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    itemType
  );

  const customMessage = effect.customMessage;

  const result: EffectReturn = {
    statement: `x_chips = ${valueCode}`,
    colour: "G.C.DARK_EDITION",
    configVariables:
      configVariables.length > 0
        ? configVariables.map((cv) => `${cv.name} = ${cv.value}`)
        : undefined,
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
