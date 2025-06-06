import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

export const generateModifyInternalVariableReturn = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  const variableName = (effect.params?.variable_name as string) || "var1";
  const operation = (effect.params?.operation as string) || "increment";
  const value = (effect.params?.value as number) || 1;

  // Define scoring triggers that need pre-return code
  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  let operationCode = "";
  let messageText = "";
  let messageColor = "G.C.WHITE";

  switch (operation) {
    case "set":
      operationCode = `card.ability.extra.${variableName} = ${value}`;
      messageText = `"Set to ${value}!"`;
      messageColor = "G.C.BLUE";
      break;
    case "increment":
      operationCode = `card.ability.extra.${variableName} = (card.ability.extra.${variableName} or 0) + ${value}`;
      messageText = `"+"..tostring(${value})`;
      messageColor = "G.C.GREEN";
      break;
    case "decrement":
      operationCode = `card.ability.extra.${variableName} = math.max(0, (card.ability.extra.${variableName} or 0) - ${value})`;
      messageText = `"-"..tostring(${value})`;
      messageColor = "G.C.RED";
      break;
    case "multiply":
      operationCode = `card.ability.extra.${variableName} = (card.ability.extra.${variableName} or 0) * ${value}`;
      messageText = `"x"..tostring(${value})`;
      messageColor = "G.C.MULT";
      break;
    case "divide":
      operationCode = `card.ability.extra.${variableName} = (card.ability.extra.${variableName} or 0) / ${value}`;
      messageText = `"÷"..tostring(${value})`;
      messageColor = "G.C.MULT";
      break;
    case "reset":
      operationCode = `card.ability.extra.${variableName} = 0`;
      messageText = `"Reset!"`;
      messageColor = "G.C.WHITE";
      break;
    default:
      operationCode = `card.ability.extra.${variableName} = (card.ability.extra.${variableName} or 0) + ${value}`;
      messageText = `"+"..tostring(${value})`;
      messageColor = "G.C.GREEN";
  }

  // Use pre-return code for scoring contexts to ensure variables are updated before other effects
  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__
                ${operationCode}
                __PRE_RETURN_CODE_END__`,
      message: messageText,
      colour: messageColor,
    };
  } else {
    return {
      statement: `func = function()
                    ${operationCode}
                    return true
                end`,
      message: messageText,
      colour: messageColor,
    };
  }
};
