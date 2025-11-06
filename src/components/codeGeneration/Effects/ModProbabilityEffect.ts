import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../Libs/effectUtils";
import { generateConfigVariables } from "../Libs/gameVariableUtils";

export const generateModProbabilityEffectCode = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const chance_part = effect.params?.part || "numerator";
  const operation = effect.params?.operation || "multiply";
  const variableName =
    sameTypeCount === 0 ? "mod_probability" : `mod_probability${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'joker'
  )

  let statement = `
  __PRE_RETURN_CODE__
  `;
  
  switch (operation) {
    case "increment": {
      statement += `${chance_part} = ${chance_part} + (${valueCode})`;
      break;
    }
    case "decrement": {
      statement += `${chance_part} = ${chance_part} - (${valueCode})`;
      break;
    }
    case "multiply": {
      statement += `${chance_part} = ${chance_part} * (${valueCode})`;
      break;
    }
    case "divide": {
      statement += `${chance_part} = ${chance_part} / (${valueCode})`;
      break;
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