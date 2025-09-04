import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import {
  generateGameVariableCode,
  parseGameVariable,
  parseRangeVariable,
} from "../../Jokers/gameVariableUtils";

export const generateModifyInternalVariableReturn = (
  effect: Effect,
  triggerType: string,
  itemType: "enhancement" | "seal" | "edition" = "enhancement"
): EffectReturn => {
  const variableName = (effect.params?.variable_name as string) || "var1";
  const operation = (effect.params?.operation as string) || "increment";
  const effectValue = effect.params?.value;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let valueCode: string;
  const abilityPath =
    itemType === "seal" ? "card.ability.seal.extra" : "card.ability.extra";

  if (parsed.isGameVariable) {
    /// change to generateConfigVariables maybe, i dunno, i dont see it necessary
    valueCode = generateGameVariableCode(effectValue);
  } else if (rangeParsed.isRangeVariable) {
    const seedName = `${variableName}_${effect.id.substring(0, 8)}`;
    valueCode = `pseudorandom('${seedName}', ${rangeParsed.min}, ${rangeParsed.max})`;
  } else if (typeof effectValue === "string") {
    valueCode = `${abilityPath}.${effectValue}`;
  } else {
    valueCode = effectValue?.toString() || "1";
  }

  const customMessage = effect.customMessage;

  const scoringTriggers = ["card_scored", "card_held"];
  const isScoring = scoringTriggers.includes(triggerType);

  let operationCode = "";
  let messageText = "";
  let messageColor = "G.C.WHITE";

  switch (operation) {
    case "set":
      operationCode = `${abilityPath}.${variableName} = ${valueCode}`;
      messageText = customMessage ? `"${customMessage}"` : "";
      messageColor = "G.C.BLUE";
      break;
    case "increment":
      operationCode = `${abilityPath}.${variableName} = (${abilityPath}.${variableName}) + ${valueCode}`;
      messageText = customMessage ? `"${customMessage}"` : "";
      messageColor = "G.C.GREEN";
      break;
    case "decrement":
      operationCode = `${abilityPath}.${variableName} = math.max(0, (${abilityPath}.${variableName}) - ${valueCode})`;
      messageText = customMessage ? `"${customMessage}"` : "";
      messageColor = "G.C.RED";
      break;
    case "multiply":
      operationCode = `${abilityPath}.${variableName} = (${abilityPath}.${variableName}) * ${valueCode}`;
      messageText = customMessage ? `"${customMessage}"` : "";
      messageColor = "G.C.MULT";
      break;
    case "divide":
      operationCode = `${abilityPath}.${variableName} = (${abilityPath}.${variableName}) / ${valueCode}`;
      messageText = customMessage ? `"${customMessage}"` : "";
      messageColor = "G.C.MULT";
      break;
    default:
      operationCode = `${abilityPath}.${variableName} = (${abilityPath}.${variableName}) + ${valueCode}`;
      messageText = customMessage ? `"${customMessage}"` : "";
      messageColor = "G.C.GREEN";
  }

  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__
                ${operationCode}
                __PRE_RETURN_CODE_END__`,
      message: messageText || undefined,
      colour: messageColor,
    };
  } else {
    return {
      statement: `func = function()
                    ${operationCode}
                    return true
                end`,
      message: messageText || undefined,
      colour: messageColor,
    };
  }
};
