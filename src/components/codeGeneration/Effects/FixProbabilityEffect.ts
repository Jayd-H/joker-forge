import { JokerData } from "../../data/BalatroUtils";
import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";
import { generateConfigVariables } from "../lib/gameVariableUtils";

export const generateFixProbabilityEffectCode = (
  effect: Effect,
  sameTypeCount: number = 0,
  joker?: JokerData
): EffectReturn => {
  const part = (effect.params?.part.value as string) || "numerator";
  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
    "set_probability",
    sameTypeCount,
    'joker',
    joker
  )

  let statement = `
  __PRE_RETURN_CODE__
  `;

  switch (part) {
    case "numerator": {
      statement += `
        numerator = ${valueCode}`;
      break;
    }
    case "denominator": {
      statement += `
        denominator = ${valueCode}`;
      break;
    }
    case "both": {
      statement += `
        numerator = ${valueCode}
        denominator = ${valueCode}`;
      break;
    }
    default: {
      statement += `
        numerator = ${valueCode}`;
    }
  }

  statement += `
  __PRE_RETURN_CODE_END__`
  return {
    statement,
    colour: "G.C.GREEN",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };
}