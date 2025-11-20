import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";
import { generateConfigVariables } from "../lib/gameVariableUtils";

export const generateModifyAllBlindsRequirementEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0,
): EffectReturn => {
  const operation = effect.params?.operation || "multiply";
  const variableName =
    sameTypeCount === 0 ? "all_blinds_size" : `all_blinds_size${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
    variableName,
    itemType
  )

  let blindscoreCode = "";

  switch (operation) {
    case "add": {
      blindscoreCode = `G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.starting_params.ante_scaling = G.GAME.starting_params.ante_scaling + ${valueCode}
                return true
            end
        }))`;
      break;
    }
    case "subtract": {
      blindscoreCode = `G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.starting_params.ante_scaling = G.GAME.starting_params.ante_scaling - ${valueCode}
                return true
            end
        }))`;
      break;
    }
    case "multiply": {
      blindscoreCode = `G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.starting_params.ante_scaling = G.GAME.starting_params.ante_scaling * ${valueCode}
                return true
            end
        }))`;
      break;
    }
    case "divide": {
      blindscoreCode = `G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.starting_params.ante_scaling = G.GAME.starting_params.ante_scaling / ${valueCode}
                return true
            end
        }))`;
      break;
    }
    case "set": {
      blindscoreCode = `G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.starting_params.ante_scaling = ${valueCode}
                return true
            end
        }))`;
        break
    }
    default: {
      blindscoreCode = `G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.starting_params.ante_scaling = G.GAME.starting_params.ante_scaling * ${valueCode}
                return true
            end
        }))`;
    }
  }

  return {
    statement: `__PRE_RETURN_CODE__${blindscoreCode}__PRE_RETURN_CODE_END__`,
    colour: "G.C.GREEN",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };
}