import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { parseGameVariable, parseRangeVariable } from "../gameVariableUtils";
import { generateGameVariableCode } from "../Consumables/gameVariableUtils";

export const generateModifyInternalVariableEffectCode = (
  effect: Effect,
  triggerType: string, 
): EffectReturn => {
  const variableName = (effect.params?.variable_name as string) || "var1";
  const operation = (effect.params?.operation as string) || "increment";
  const effectValue = effect.params?.value;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);
  const indexMethod = effect.params?.index_method || "self"

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
    case "index":
      switch (indexMethod) {
        case "self":
          operationCode = `
          for i = 1, #G.jokers.cards do
            if G.jokers.cards[i] == card then
                card.ability.extra.${variableName} = i
                break
            end
        end`;
          break
        case "random":
          operationCode = `card.ability.extra.${variableName} = math.random(1, #G.jokers.cards)`
          break
        case "first":
          operationCode = `card.ability.extra.${variableName} = 1`
          break
        case "last":
          operationCode = `card.ability.extra.${variableName} = #G.jokers.cards`
          break
        case "left":
          operationCode = `local my_pos = nil
          for i = 1, #G.jokers.cards do
            if G.jokers.cards[i] == card then
                my_pos = i
                break
            end
        end
        card.ability.extra.${variableName} = math.max(my_pos - 1, 0)
        `
          break
        case "right":
          operationCode = `local my_pos = nil
          for i = 1, #G.jokers.cards do
            if G.jokers.cards[i] == card then
                my_pos = i
                break
            end
        end
        if my_pos > #G.jokers.cards then 
          my_pos = -1
        end
        card.ability.extra.${variableName} = my_pos + 1
        `
          break
        case "key":
          const searchKey = (effect.params?.joker_key as string) || "j_joker"
          operationCode = `local search_key = '${searchKey}'
          card.ability.extra.${variableName} = 0
          for i = 1, #G.jokers.cards do
            if G.jokers.cards[i].config.center.key == search_key then
                card.ability.extra.${variableName} = i
                break
            end
          end`
          break
        case "variable":
          const searchVar = (effect.params?.joker_variable) || "jokerVar"
          operationCode = `local search_key = card.ability.extra.${searchVar}
          card.ability.extra.${variableName} = 0
          for i = 1, #G.jokers.cards do
            if G.jokers.cards[i].config.center.key == search_key then
                card.ability.extra.${variableName} = i
                break
            end
          end`
          break
        case "selected_joker":
          operationCode = `
          for i = 1, #G.jokers.cards do
            if G.jokers.cards[i] == G.jokers.highlighted[1] then
                card.ability.extra.${variableName}= i
                break
            end
        end`
          break
        case "evaled_joker":
          operationCode = `
          for i = 1, #G.jokers.cards do
            if G.jokers.cards[i] == context.other_joker then
                card.ability.extra.${variableName}= i
                break
            end
        end`
          break
      }
    break
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
