import { getGameVariableById } from "../../data/Jokers/GameVars";
import { ConfigExtraVariable } from "./effectUtils";

export interface ParsedGameVariable {
  isGameVariable: boolean;
  gameVariableId?: string;
  multiplier?: number;
  startsFrom?: number;
  code?: string;
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

export const parseGameVariable = (value: unknown): ParsedGameVariable => {
  if (typeof value === "string" && value.startsWith("GAMEVAR:")) {
    const parts = value.replace("GAMEVAR:", "").split("|");
    const gameVariableId = parts[0];
    const multiplier = parseFloat(parts[1] || "1");
    const startsFrom = parseFloat(parts[2] || "0");
    const gameVariable = getGameVariableById(gameVariableId);

    return {
      isGameVariable: true,
      gameVariableId,
      multiplier,
      startsFrom,
      code: gameVariable?.code,
    };
  }

  return {
    isGameVariable: false,
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

export const generateGameVariableCode = (
  value: unknown,
  itemType: "seal" | "enhancement" | "hook" | "edition" = "enhancement"
): string => {
  const parsed = parseGameVariable(value);

  if (
    parsed.isGameVariable &&
    parsed.code &&
    parsed.multiplier !== undefined &&
    parsed.startsFrom !== undefined
  ) {
    const gameVariable = getGameVariableById(parsed.gameVariableId!);
    const configVarName = gameVariable?.label
      .replace(/\s+/g, "")
      .replace(/^([0-9])/, "_$1") // if the name starts with a number prefix it with _
      .toLowerCase();
    const startsFromCode =
      itemType === "hook"
        ? parsed.startsFrom.toString()
        : `card.ability.extra.${configVarName}`;

    if (parsed.multiplier === 1 && parsed.startsFrom === 0) {
      return parsed.code;
    } else if (parsed.startsFrom === 0) {
      return `(${parsed.code}) * ${parsed.multiplier}`;
    } else if (parsed.multiplier === 1) {
      return `${startsFromCode} + (${parsed.code})`;
    } else {
      return `${startsFromCode} + (${parsed.code}) * ${parsed.multiplier}`;
    }
  }

  if (typeof value === "string") {
    return `card.ability.extra.${value}`;
  }

  return typeof value === "number" ? value.toString() : "0";
};

export const generateConfigVariables = (
  effectValue: unknown,
  effectId: string,
  variableName: string,
  itemType: "enhancement" | "seal" | "hook" | "edition" = "enhancement"
): ConfigVariablesReturn => {
  effectValue = effectValue ?? 1;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let abilityPath: string;
  if (itemType === "seal") {
    abilityPath = "card.ability.seal.extra";
  } else if (itemType === "edition") {
    abilityPath = "card.edition.extra";
  } else {
    abilityPath = "card.ability.extra";
  }

  let valueCode: string;
  const configVariables: ConfigExtraVariable[] = [];

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(effectValue, itemType);
  } else if (rangeParsed.isRangeVariable) {
    const seedName = `${variableName}_${effectId.substring(0, 8)}`;
    valueCode = `pseudorandom('${seedName}', ${abilityPath}.${variableName}_min, ${abilityPath}.${variableName}_max)`;

    configVariables.push(
      { name: `${variableName}_min`, value: rangeParsed.min ?? 1 },
      { name: `${variableName}_max`, value: rangeParsed.max ?? 5 }
    );
  } else if (itemType === "hook") {
    valueCode = `${effectValue}`;
  } else if (typeof effectValue === "string") {
    if (effectValue.endsWith("_value")) {
      valueCode = effectValue;
    } else {
      valueCode = `${abilityPath}.${effectValue}`;
    }
  } else {
    valueCode = `${abilityPath}.${variableName}`;

    configVariables.push({
      name: variableName,
      value: Number(effectValue ?? 1),
    });
  }

  return {
    valueCode,
    configVariables,
    isXVariable: {
      isGameVariable: parsed.isGameVariable,
      isRangeVariable: rangeParsed.isRangeVariable,
    },
  };
};
