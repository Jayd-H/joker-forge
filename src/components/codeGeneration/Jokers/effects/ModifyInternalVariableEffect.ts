import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import {
  generateGameVariableCode,
  parseGameVariable,
  parseRangeVariable,
} from "../gameVariableUtils";

export const generateModifyInternalVariableReturn = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  const variableName = (effect.params?.variable_name as string) || "var1";
  const operation = (effect.params?.operation as string) || "increment";
  const effectValue = effect.params?.value;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let valueCode: string;

  if (parsed.isGameVariable) { /// change to generateConfigVariables maybe, i dunno, i dont see it necessary
    valueCode = generateGameVariableCode(effectValue);
  } else if (rangeParsed.isRangeVariable) {
    const seedName = `${variableName}_${effect.id.substring(0, 8)}`;
    valueCode = `pseudorandom('${seedName}', ${rangeParsed.min}, ${rangeParsed.max})`;
  } else if (typeof effectValue === "string") {
    valueCode = `card.ability.extra.${effectValue}`;
  } else {
    valueCode = effectValue?.toString() || "1";
  }

  const customMessage = effect.customMessage;

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  let operationCode = "";
  const messageText = customMessage ? `"${customMessage}"` : undefined;
  let messageColor = "G.C.WHITE";

  switch (operation) {
    case "set":
      operationCode = `card.ability.extra.${variableName} = ${valueCode}`;
      messageColor = "G.C.BLUE";
      break;
    case "increment":
      operationCode = `card.ability.extra.${variableName} = (card.ability.extra.${variableName}) + ${valueCode}`;
      messageColor = "G.C.GREEN";
      break;
    case "decrement":
      operationCode = `card.ability.extra.${variableName} = math.max(0, (card.ability.extra.${variableName}) - ${valueCode})`;
      messageColor = "G.C.RED";
      break;
    case "multiply":
      operationCode = `card.ability.extra.${variableName} = (card.ability.extra.${variableName}) * ${valueCode}`;
      messageColor = "G.C.MULT";
      break;
    case "divide":
      operationCode = `card.ability.extra.${variableName} = (card.ability.extra.${variableName}) / ${valueCode}`;
      messageColor = "G.C.MULT";
      break;
    case "power":
      operationCode = `card.ability.extra.${variableName} = (card.ability.extra.${variableName}) ^ ${valueCode}`;
      messageColor = "G.C.BLUE";
      break;
    case "absolute":
      operationCode = `card.ability.extra.${variableName} = math.abs(card.ability.extra.${variableName})`;
      messageColor = "G.C.BLUE";
      break;
    case "natural_log":
      operationCode = `card.ability.extra.${variableName} = math.log(card.ability.extra.${variableName})`;
      messageColor = "G.C.BLUE";
      break;
    case "log10":
      operationCode = `card.ability.extra.${variableName} = math.log10(card.ability.extra.${variableName})`;
      messageColor = "G.C.BLUE";
      break;
    case "square_root":
      operationCode = `card.ability.extra.${variableName} = math.sqrt(card.ability.extra.${variableName})`;
      messageColor = "G.C.BLUE";
      break;
    case "ceil":
      operationCode = `card.ability.extra.${variableName} = math.ceil(card.ability.extra.${variableName})`;
      messageColor = "G.C.BLUE";
      break;
    case "floor":
      operationCode = `card.ability.extra.${variableName} = math.floor(card.ability.extra.${variableName})`;
      messageColor = "G.C.BLUE";
      break;
    default:
      operationCode = `card.ability.extra.${variableName} = (card.ability.extra.${variableName}) + ${valueCode}`;
      messageColor = "G.C.GREEN";
  }

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
