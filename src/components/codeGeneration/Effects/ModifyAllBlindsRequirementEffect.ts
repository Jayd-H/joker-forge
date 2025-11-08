import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../Libs/effectUtils";
import { generateConfigVariables } from "../Libs/gameVariableUtils";

export const generateModifyAllBlindsRequirementEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0,
): EffectReturn => {
  const operation = effect.params?.operation || "multiply";
  const variableName =
    sameTypeCount === 0 ? "all_blinds_size" : `all_blinds_size${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    itemType
  )

  let statement = "";

  switch (operation) {
    case "add": {
      statement = `G.GAME.starting_params.ante_scaling = G.GAME.starting_params.ante_scaling + ${valueCode}`;
      break;
    }
    case "subtract": {
      statement = `G.GAME.starting_params.ante_scaling = G.GAME.starting_params.ante_scaling - ${valueCode}`;
      break;
    }
    case "multiply": {
      statement = `G.GAME.starting_params.ante_scaling = G.GAME.starting_params.ante_scaling * ${valueCode}`;
      break;
    }
    case "divide": {
      statement = `G.GAME.starting_params.ante_scaling = G.GAME.starting_params.ante_scaling / ${valueCode}`;
      break;
    }
    case "set": {
      statement = `G.GAME.starting_params.ante_scaling = ${valueCode}`;
        break
    }
    default: {
      statement = `G.GAME.starting_params.ante_scaling = G.GAME.starting_params.ante_scaling * ${valueCode}`;
    }
  }

  return {
    statement,
    colour: "G.C.GREEN",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };
}