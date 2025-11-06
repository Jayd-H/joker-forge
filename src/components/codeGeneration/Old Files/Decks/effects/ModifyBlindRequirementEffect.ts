import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateModifyBlindRequirementReturn = (
  effect: Effect,
): EffectReturn => {
  const operation = effect.params?.operation || "multiply";
  const value = effect.params?.value ?? 2

  const valueCode = generateGameVariableCode(value);

  let BlindCode = "";

  switch (operation) {
    case "add": {
      BlindCode = `G.GAME.starting_params.ante_scaling = G.GAME.starting_params.ante_scaling + ${valueCode}`;
      break;
    }
    case "subtract": {
      BlindCode = `G.GAME.starting_params.ante_scaling = G.GAME.starting_params.ante_scaling - ${valueCode}`;
      break;
    }
    case "multiply": {
      BlindCode = `G.GAME.starting_params.ante_scaling = G.GAME.starting_params.ante_scaling * ${valueCode}`;
      break;
    }
    case "divide": {
      BlindCode = `G.GAME.starting_params.ante_scaling = G.GAME.starting_params.ante_scaling / ${valueCode}`;
      break;
    }
    case "set": {
      BlindCode = `G.GAME.starting_params.ante_scaling = ${valueCode}`;
        break
    }
    default: {
      BlindCode = `G.GAME.starting_params.ante_scaling = G.GAME.starting_params.ante_scaling * ${valueCode}`;
    }
  }

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`base_blind_size_value = ${value}`];

  return {
    statement: BlindCode,
    colour: "G.C.GREEN",
    configVariables,
  };
};