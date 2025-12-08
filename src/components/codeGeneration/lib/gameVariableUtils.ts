import { EditionData, EnhancementData, JokerData, SealData } from "../../data/BalatroUtils";
import { getGameVariableById } from "../../data/GameVars";
import { detectValueType } from "../../generic/RuleBlockUpdater";
import { Effect } from "../../ruleBuilder";
import { ConfigExtraVariable } from "./effectUtils";

export interface ParsedGameVariable {
  gameVariableId: string;
  multiplier: number;
  startsFrom: number;
  code: string;
}

export interface ParsedRangeVariable {
  isRangeVariable: boolean;
  min?: number;
  max?: number;
}

export interface ConfigVariablesReturn {
  valueCode: string;
  configVariables: ConfigExtraVariable[];
  isXVariable: {
    isGameVariable: boolean;
    isRangeVariable: boolean;
  };
}

export const parseGameVariable = (value: string): ParsedGameVariable => {
  const parts = value.replace("GAMEVAR:", "").split("|");
  const gameVariableId = parts[0];
  const multiplier = parseFloat(parts[1] || "1");
  const startsFrom = parseFloat(parts[2] || "0");
  const gameVariable = getGameVariableById(gameVariableId);

  return {
    gameVariableId,
    multiplier,
    startsFrom,
    code: gameVariable?.code ?? '',
  };
};

export const parseRangeVariable = (value: unknown): ParsedRangeVariable => {
  if (typeof value === "string" && value.startsWith("RANGE:")) {
    const parts = value.replace("RANGE:", "").split("|");
    const min = parseFloat(parts[0] || "1");
    const max = parseFloat(parts[1] || "5");

    return {
      isRangeVariable: true,
      min,
      max,
    };
  }

  return {
    isRangeVariable: false,
  };
};

export const generateValueCode = (
  item: {value: unknown, valueType?: string},
  itemType?: string,
  object?: JokerData | EnhancementData | EditionData | SealData
): string => {
  console.log(item)
  if (item && item.valueType !== undefined && item.valueType === "number") return `${item.value}`
  if (!item || !item.value) return ''

  if (item.valueType === "unknown") {
    item.valueType = detectValueType(item.value, object)
  }

  const abilityPath = 
    (itemType === "deck") ? "back.ability.extra" : 
    (itemType === "seal") ? "card.ability.seal.extra" : 
    (itemType === "edition") ? "card.ability.edition" : 
    "card.ability.extra"

  if (item.valueType === "conflicted_user_var") {
    return `${item.value}_value`
  }
  
  if (item.valueType === "game_var") {
    const parsedGameVar = parseGameVariable(item.value as string)
    const gameVariable = getGameVariableById(parsedGameVar.gameVariableId!);
    const configVarName = gameVariable?.label
      .replace(/\s+/g, "")
      .replace(/^([0-9])/, "_$1") // if the name starts with a number prefix it with _
      .toLowerCase();
    const startsFromCode =
      itemType === "hook"
        ? parsedGameVar.startsFrom.toString()
        : `${abilityPath}.${configVarName}`

    if (parsedGameVar.multiplier === 1 && parsedGameVar.startsFrom === 0) {
      return parsedGameVar.code;
    } else if (parsedGameVar.startsFrom === 0) {
      return `(${parsedGameVar.code}) * ${parsedGameVar.multiplier}`;
    } else if (parsedGameVar.multiplier === 1) {
      return `${startsFromCode} + (${parsedGameVar.code})`;
    } else {
      return `${startsFromCode} + (${parsedGameVar.code}) * ${parsedGameVar.multiplier}`;
    }
  }

  if (item.valueType === "range_var") {
    const parsedRangeVar = parseRangeVariable(item.value as string)
    return `pseudorandom('${item.value}', ${parsedRangeVar.min}, ${parsedRangeVar.max})`;  
  }

  if (item.valueType === "user_var") {
    if (object && object.userVariables && object.userVariables.some((v) => v.name === item.value && v.type === "suit")) {
      return `G.GAME.current_round.${item.value}_card.suit`
    }
    if (object && object.userVariables && object.userVariables.some((v) => v.name === item.value && v.type === "rank")) {
      return `G.GAME.current_round.${item.value}_card.id`
    }
    if (object && object.userVariables && object.userVariables.some((v) => v.name === item.value && v.type === "pokerhand")) {
      return `G.GAME.current_round.${item.value}_hand`
    }
    return `${abilityPath}.${item.value}`;
  }
  return (`${item.value}` as string);
}

export const generateConfigVariables = (
  effect: Effect,
  valueIndex: string,
  variableNameString: string,
  sameTypeCount: number,
  itemType: string, 
  object?: JokerData | EnhancementData | EditionData | SealData,
): ConfigVariablesReturn => {
  if (!effect.params[valueIndex]?.value && effect.params[valueIndex]?.valueType !== "number") return {
    valueCode: '', 
    configVariables: [], 
    isXVariable: {isGameVariable: false, isRangeVariable: false}
  }
  
  const effectValue: unknown = effect.params[valueIndex]?.value
  const effectValueType: string = effect.params[valueIndex]?.valueType ?? "text"
  const variableName = (
    sameTypeCount !== 1 ? `${variableNameString}${sameTypeCount}` : `${variableNameString}`)

  let valueCode: string;
  const configVariables: ConfigExtraVariable[] = [];
  
  valueCode = generateValueCode(effect.params[valueIndex], itemType, object) as string;
  if (effectValueType === 'range_var') {
    const parts = valueCode.replace("RANGE:", "").split("|");
    const min = parseFloat(parts[0] || "1");
    const max = parseFloat(parts[1] || "5");

    configVariables.push(
      { name: `${variableName}_min`, value: min },
      { name: `${variableName}_max`, value: max }
    );
  } 

  if (effectValueType === "number") {
    configVariables.push({
      name: variableName,
      value: Number(effectValue ?? 1),
    });
  }
  
  return {
    valueCode,
    configVariables,
    isXVariable: {
      isGameVariable: effectValueType === 'game_var',
      isRangeVariable: effectValueType === 'range_var',
    },
  };
};
