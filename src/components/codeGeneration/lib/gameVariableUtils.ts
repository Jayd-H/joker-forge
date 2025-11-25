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
  value: string,
  valueType?: string,
  isHook?: boolean,
  object?: JokerData | EnhancementData | EditionData | SealData
): string => {
  if (!value) return ''

  if (valueType === "unknown") {
    valueType = detectValueType(value, object)
  }

  if (valueType === "game_var") {
    const parsedGameVar = parseGameVariable(value)
    const gameVariable = getGameVariableById(parsedGameVar.gameVariableId!);
    const configVarName = gameVariable?.label
      .replace(/\s+/g, "")
      .replace(/^([0-9])/, "_$1") // if the name starts with a number prefix it with _
      .toLowerCase();
    const startsFromCode = isHook ?
        parsedGameVar.startsFrom.toString() :
        `card.ability.extra.${configVarName}`;

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

  if (valueType === "range_var") {
    const parsedRangeVar = parseRangeVariable(value)
    return `pseudorandom('${value}', ${parsedRangeVar.min}, ${parsedRangeVar.max})`;  
  }

  if (valueType === "user_var") {
    if (object && object.userVariables && object.userVariables.some((v) => v.name === value && v.type === "suit")) {
      return `G.GAME.current_round.${value}_card.suit`
    }
    if (object && object.userVariables && object.userVariables.some((v) => v.name === value && v.type === "rank")) {
      return `G.GAME.current_round.${value}_card.id`
    }
    if (object && object.userVariables && object.userVariables.some((v) => v.name === value && v.type === "pokerhand")) {
      return `G.GAME.current_round.${value}_hand`
    }
    return `card.ability.extra.${value}`;
  }

  return value;
}

export const generateGameVariableCode = (
  item: {value: unknown, valueType?: string},
  itemType: string
): string => {
  if (!item || !item.valueType) return "0"

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
        : itemType === "deck" 
        ? `back.ability.extra.${configVarName}`
        : `card.ability.extra.${configVarName}`;

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
    const parsedRangeVar = parseRangeVariable(item.value)
    return `pseudorandom('${item.value as string}', ${parsedRangeVar.min}, ${parsedRangeVar.max})`;  
  }

  if (item.valueType === "user_var") {
    return itemType === "deck" 
        ? `back.ability.extra.${item.value}`
        : `card.ability.extra.${item.value}`;;
  }

  return item.value as string;
};


export const generateConfigVariables = (
  effect: Effect,
  valueIndex: string,
  variableName: string,
  itemType: string
): ConfigVariablesReturn => {
  const effectValue: unknown = effect.params[valueIndex]?.value ?? 1
  const effectValueType: string = effect.params[valueIndex]?.valueType ?? "text"
  const effectId: string = effect.id
  
  let abilityPath: string;
  if (itemType === "seal") {
    abilityPath = "card.ability.seal.extra";
  } else if (itemType === "edition") {
    abilityPath = "card.edition.extra";
  } else if (itemType === "deck") {
    abilityPath = "back.ability.extra";
  } else {
    abilityPath = "card.ability.extra";
  }

  let valueCode: string;
  const configVariables: ConfigExtraVariable[] = [];
  if (effectValueType === 'game_var') {
    valueCode = generateGameVariableCode(effect.params[valueIndex], itemType);
  } else if (effectValueType === 'range_var') {
    const seedName = `${variableName}_${effectId.substring(0, 8)}`;
    valueCode = `pseudorandom('${seedName}', ${abilityPath}.${variableName}_min, ${abilityPath}.${variableName}_max)`;
    const rangeParsed = parseRangeVariable(effectValue);

    configVariables.push(
      { name: `${variableName}_min`, value: rangeParsed.min ?? 1 },
      { name: `${variableName}_max`, value: rangeParsed.max ?? 5 }
    );
  } else if (itemType === "hook") {
    valueCode = `${effectValue}`;
  } else if (effectValueType === "user_var") {
    valueCode = `${abilityPath}.${effectValue}`;
  } else if (effectValueType === "number") {
    valueCode = `${effectValue as string}`;
    configVariables.push({
      name: variableName,
      value: Number(effectValue ?? 1),
    });
  } else {
    valueCode = `${effectValue as string}`;

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
