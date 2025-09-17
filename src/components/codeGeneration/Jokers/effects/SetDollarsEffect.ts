import type { Effect } from "../../../ruleBuilder/types";
import {
  generateConfigVariables
} from "../gameVariableUtils";
import type { EffectReturn } from "../effectUtils";

export const generateSetDollarsReturn = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = (effect.params?.operation as string) || "add";

  const variableName =
    sameTypeCount === 0 ? "dollars" : `dollars${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName
  )

  const customMessage = effect.customMessage;

  let result: EffectReturn;

  switch (operation) {
    case "add": {
      result = {
        statement: `dollars = ${valueCode}`,
        colour: "G.C.MONEY",
        configVariables:
          configVariables.length > 0 ? configVariables : undefined,
      };

      if (customMessage) {
        result.message = `"${customMessage}"`;
      }
      break;
    }

    case "subtract": {
      result = {
        statement: `dollars = -${valueCode}`,
        colour: "G.C.MONEY",
        configVariables:
          configVariables.length > 0 ? configVariables : undefined,
      };

      if (customMessage) {
        result.message = `"${customMessage}"`;
      }
      break;
    }

    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Set to $"..tostring(${valueCode})`;

      result = {
        statement: `func = function()
                    local target_amount = ${valueCode}
                    local current_amount = G.GAME.dollars
                    local difference = target_amount - current_amount
                    ease_dollars(difference)
                    card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.MONEY})
                    return true
                end`,
        colour: "G.C.MONEY",
        configVariables:
          configVariables.length > 0 ? configVariables : undefined,
      };
      break;
    }

    default: {
      result = {
        statement: `dollars = ${valueCode}`,
        colour: "G.C.MONEY",
        configVariables:
          configVariables.length > 0 ? configVariables : undefined,
      };

      if (customMessage) {
        result.message = `"${customMessage}"`;
      }
    }
  }

  return result;
};
