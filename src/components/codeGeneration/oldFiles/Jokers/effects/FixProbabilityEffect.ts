import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import {
  generateConfigVariables
} from "../gameVariableUtils";

export const generateFixProbabilityReturn = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const part = effect.params?.part || "numerator";

  const variableName =
    sameTypeCount === 0 ? "set_probability" : `set_probability${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName
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
};