import { getGameVariableById } from "../../data/Jokers/GameVars";
import type { Rule } from "../../ruleBuilder/types";

export interface ParsedGameVariable {
  isGameVariable: boolean;
  gameVariableId?: string;
  multiplier?: number;
  startsFrom?: number;
  code?: string;
}

export interface GameVariableConfig {
  name: string;
  code: string;
  startsFrom: number;
  multiplier: number;
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

export const generateGameVariableCode = (value: unknown): string => {
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

    if (parsed.multiplier === 1 && parsed.startsFrom === 0) {
      return parsed.code;
    } else if (parsed.startsFrom === 0) {
      return `(${parsed.code}) * ${parsed.multiplier}`;
    } else if (parsed.multiplier === 1) {
      return `card.ability.extra.${configVarName} + (${parsed.code})`;
    } else {
      return `card.ability.extra.${configVarName} + (${parsed.code}) * ${parsed.multiplier}`;
    }
  }

  if (typeof value === "string") {
    return `card.ability.extra.${value}`;
  }

  return typeof value === "number" ? value.toString() : "0";
};

export const extractGameVariablesFromRules = (
  rules: Rule[]
): GameVariableConfig[] => {
  const gameVariables = new Map<string, GameVariableConfig>();

  const extractFromValue = (value: unknown) => {
    const parsed = parseGameVariable(value);
    if (parsed.isGameVariable && parsed.gameVariableId && parsed.code) {
      const gameVariable = getGameVariableById(parsed.gameVariableId);
      if (gameVariable) {
        const configName = gameVariable.label.replace(/\s+/g, "").toLowerCase();
        gameVariables.set(configName, {
          name: configName,
          code: parsed.code,
          startsFrom: parsed.startsFrom || 0,
          multiplier: parsed.multiplier || 1,
        });
      }
    }
  };

  const extractFromObject = (obj: unknown) => {
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      Object.values(obj as Record<string, unknown>).forEach((value) => {
        extractFromValue(value);
        if (value && typeof value === "object" && !Array.isArray(value)) {
          extractFromObject(value);
        }
      });
    }
  };

  rules.forEach((rule) => {
    // Extract from conditions
    rule.conditionGroups?.forEach((group) => {
      group.conditions?.forEach((condition) => {
        extractFromObject(condition.params);
      });
    });

    // Extract from effects
    rule.effects?.forEach((effect) => {
      extractFromObject(effect.params);
    });

    // Extract from random groups
    rule.randomGroups?.forEach((group) => {
      group.effects?.forEach((effect) => {
        extractFromObject(effect.params);
      });
    });
  });

  return Array.from(gameVariables.values());
};
