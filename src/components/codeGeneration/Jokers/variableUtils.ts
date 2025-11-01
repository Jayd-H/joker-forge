import type { Rule, Effect } from "../../ruleBuilder/types";
import type {
  JokerData,
  ConsumableData,
  EnhancementData,
  UserVariable,
  SealData,
  EditionData,
  VoucherData,
  DeckData
} from "../../data/BalatroUtils";
import { parseGameVariable } from "../Consumables/gameVariableUtils";
import { getGameVariableById } from "../../data/GameVars";
import {
  SUIT_VALUES,
  RANK_VALUES,
  RANK_LABELS,
  ENHANCEMENT_VALUES,
  EDITION_VALUES,
  SEAL_VALUES,
} from "../../data/BalatroUtils";

export interface VariableInfo {
  name: string;
  initialValue: number;
  usedInEffects: string[];
}

export interface VariableUsage {
  variableName: string;
  ruleId: string;
  ruleIndex: number;
  type: "condition" | "effect";
  itemId: string;
  count: number;
}

export interface GameVariableInfo {
  id: string;
  name: string;
  description: string;
  multiplier: number;
  startsFrom: number;
  code: string;
}

export interface SuitVariableInfo {
  isSuitVariable: boolean;
  variableName?: string;
  code?: string;
}

export interface RankVariableInfo {
  isRankVariable: boolean;
  variableName?: string;
  code?: string;
}

export interface PokerHandVariableInfo {
  isPokerHandVariable: boolean;
  variableName?: string;
  code?: string;
}

export const coordinateVariableConflicts = (
  effects: Effect[]
): {
  preReturnCode?: string;
  modifiedEffects: Effect[];
} => {
  const variableOperations: Array<{
    varName: string;
    type: "read" | "write";
    effectIndex: number;
    effect: Effect;
  }> = [];

  effects.forEach((effect, index) => {
    if (effect.type === "modify_internal_variable") {
      const varName = effect.params.variable_name as string;
      if (varName) {
        variableOperations.push({
          varName,
          type: "write",
          effectIndex: index,
          effect,
        });
      }
    }

    const explicitVariables = extractExplicitVariablesFromEffect(effect);
    explicitVariables.forEach((varName) => {
      variableOperations.push({
        varName,
        type: "read",
        effectIndex: index,
        effect,
      });
    });
  });

  const varGroups = variableOperations.reduce((acc, op) => {
    if (!acc[op.varName]) {
      acc[op.varName] = [];
    }
    acc[op.varName].push(op);
    return acc;
  }, {} as Record<string, typeof variableOperations>);

  const conflictedVars: string[] = [];

  Object.entries(varGroups).forEach(([varName, operations]) => {
    const reads = operations.filter((op) => op.type === "read");
    const writes = operations.filter((op) => op.type === "write");

    if (reads.length === 0 || writes.length === 0) {
      return;
    }

    for (const read of reads) {
      for (const write of writes) {
        if (read.effectIndex < write.effectIndex) {
          conflictedVars.push(varName);
          return;
        }
      }
    }
  });

  if (conflictedVars.length === 0) {
    return { modifiedEffects: effects };
  }

  const preReturnCode = conflictedVars
    .map((varName) => `local ${varName}_value = card.ability.extra.${varName}`)
    .join("\n                ");

  const modifiedEffects = effects.map((effect) => {
    if (effect.type === "modify_internal_variable") {
      return effect;
    }

    const modifiedParams = { ...effect.params };
    const explicitVariables = extractExplicitVariablesFromEffect(effect);

    explicitVariables.forEach((varName) => {
      if (conflictedVars.includes(varName)) {
        Object.entries(effect.params).forEach(([key, value]) => {
          if (value === varName) {
            modifiedParams[key] = `${varName}_value`;
          }
        });
      }
    });

    return { ...effect, params: modifiedParams };
  });

  return { preReturnCode, modifiedEffects };
};

const extractExplicitVariablesFromEffect = (effect: Effect): string[] => {
  const variables: string[] = [];

  const keyParameterNames = new Set([
    "joker_key",
    "consumable_key",
    "card_key",
    "target_joker",
    "specific_joker",
    "blind_name",
    "tag_key",
    "enhancement_type",
    "edition_type",
    "seal_type",
    "suit_type",
    "rank_type",
    "poker_hand_type",
    "set",
    "specific_hand",
  ]);

  Object.entries(effect.params).forEach(([paramName, value]) => {
    if (keyParameterNames.has(paramName)) {
      return;
    }

    if (
      typeof value === "string" &&
      (value.startsWith("j_") ||
        value.startsWith("c_") ||
        value.startsWith("m_") ||
        value.startsWith("e_") ||
        value.startsWith("b_") ||
        value.startsWith("tag_") ||
        value.startsWith("v_"))
    ) {
      return;
    }

    if (typeof value === "string" && isUserDefinedVariable(value)) {
      variables.push(value);
    }
  });

  return variables;
};

export const extractGameVariablesFromRules = (
  rules: Rule[]
): GameVariableInfo[] => {
  const gameVariableMap = new Map<string, GameVariableInfo>();

  const processParams = (params: Record<string, unknown>) => {
    Object.values(params).forEach((value) => {
      const parsed = parseGameVariable(value);
      if (parsed.isGameVariable && parsed.gameVariableId && parsed.code) {
        const gameVar = getGameVariableById(parsed.gameVariableId);
        if (gameVar && !gameVariableMap.has(parsed.gameVariableId)) {
          gameVariableMap.set(parsed.gameVariableId, {
            id: parsed.gameVariableId,
            name: gameVar.label,
            description: gameVar.description,
            multiplier: parsed.multiplier || 1,
            startsFrom: parsed.startsFrom || 0,
            code: parsed.code,
          });
        }
      }
    });
  };

  rules.forEach((rule) => {
    rule.conditionGroups.forEach((group) => {
      group.conditions.forEach((condition) => {
        processParams(condition.params);
      });
    });

    (rule.effects || []).forEach((effect) => {
      processParams(effect.params);
    });

    (rule.randomGroups || []).forEach((group) => {
      group.effects.forEach((effect) => {
        processParams(effect.params);
      });
    });
  });

  return Array.from(gameVariableMap.values());
};

export const getSuitVariables = (
  item: JokerData | EnhancementData
): UserVariable[] => {
  return (item.userVariables || []).filter((v) => v.type === "suit");
};

export const getNumberVariables = (
  item: JokerData | EnhancementData
): UserVariable[] => {
  return (item.userVariables || []).filter((v) => v.type === "number");
};

export const getJokerVariables = (
  item: JokerData | EnhancementData
): UserVariable[] => {
  return (item.userVariables || []).filter((v) => v.type === "joker");
};

export const getRankVariables = (
  item: JokerData | EnhancementData
): UserVariable[] => {
  return (item.userVariables || []).filter((v) => v.type === "rank");
};

export const parseSuitVariable = (
  value: unknown,
  item?: JokerData | EnhancementData
): SuitVariableInfo => {
  if (typeof value === "string" && item?.userVariables) {
    const suitVariable = item.userVariables.find(
      (v) => v.name === value && v.type === "suit"
    );

    if (suitVariable) {
      return {
        isSuitVariable: true,
        variableName: value,
        code: `G.GAME.current_round.${value}_card.suit`,
      };
    }
  }

  return {
    isSuitVariable: false,
  };
};

export const parseRankVariable = (
  value: unknown,
  item?: JokerData | EnhancementData
): RankVariableInfo => {
  if (typeof value === "string" && item?.userVariables) {
    const rankVariable = item.userVariables.find(
      (v) => v.name === value && v.type === "rank"
    );

    if (rankVariable) {
      return {
        isRankVariable: true,
        variableName: value,
        code: `G.GAME.current_round.${value}_card.id`,
      };
    }
  }

  return {
    isRankVariable: false,
  };
};

export const addSuitVariablesToOptions = (
  baseOptions: Array<{ value: string; label: string }>,
  item: JokerData | EnhancementData
): Array<{ value: string; label: string }> => {
  const suitVariables = getSuitVariables(item);
  const variableOptions = suitVariables.map((variable) => ({
    value: variable.name,
    label: `${variable.name} (suit variable)`,
  }));

  return [...baseOptions, ...variableOptions];
};

export const addNumberVariablesToOptions = (
  baseOptions: Array<{ value: string; label: string }>,
  item: JokerData | EnhancementData
): Array<{ value: string; label: string }> => {
  const numberVariables = getNumberVariables(item);
  const variableOptions = numberVariables.map((variable) => ({
    value: variable.name,
    label: `${variable.name} (number variable)`,
  }));

  return [...baseOptions, ...variableOptions];
};

export const addJokerVariablesToOptions = (
  baseOptions: Array<{ value: string; label: string }>,
  item: JokerData | EnhancementData
): Array<{ value: string; label: string }> => {
  const jokerVariables = getJokerVariables(item);
  const variableOptions = jokerVariables.map((variable) => ({
    value: variable.name,
    label: `${variable.name} (joker variable)`,
  }));

  return [...baseOptions, ...variableOptions];
};

export const addRankVariablesToOptions = (
  baseOptions: Array<{ value: string; label: string }>,
  item: JokerData | EnhancementData
): Array<{ value: string; label: string }> => {
  const rankVariables = getRankVariables(item);
  const variableOptions = rankVariables.map((variable) => ({
    value: variable.name,
    label: `${variable.name} (rank variable)`,
  }));

  return [...baseOptions, ...variableOptions];
};

const isUserDefinedVariable = (str: string): boolean => {
  return (
    /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(str) &&
    !isReservedKeyword(str) &&
    !isBuiltInValue(str)
  );
};

export const getPokerHandVariables = (
  item: JokerData | EnhancementData
): UserVariable[] => {
  return (item.userVariables || []).filter((v) => v.type === "pokerhand");
};

export const parsePokerHandVariable = (
  value: unknown,
  item?: JokerData | EnhancementData
): PokerHandVariableInfo => {
  if (typeof value === "string" && item?.userVariables) {
    const pokerHandVariable = item.userVariables.find(
      (v) => v.name === value && v.type === "pokerhand"
    );

    if (pokerHandVariable) {
      return {
        isPokerHandVariable: true,
        variableName: value,
        code: `G.GAME.current_round.${value}_hand`,
      };
    }
  }

  return {
    isPokerHandVariable: false,
  };
};

export const addPokerHandVariablesToOptions = (
  baseOptions: Array<{ value: string; label: string }>,
  item: JokerData | EnhancementData
): Array<{ value: string; label: string }> => {
  const pokerHandVariables = getPokerHandVariables(item);
  const variableOptions = pokerHandVariables.map((variable) => ({
    value: variable.name,
    label: `${variable.name} (poker hand variable)`,
  }));

  return [...baseOptions, ...variableOptions];
};

const isReservedKeyword = (str: string): boolean => {
  const reserved = new Set([
    "true",
    "false",
    "nil",
    "and",
    "or",
    "not",
    "if",
    "then",
    "else",
    "end",
    "function",
    "return",
    "local",
    "for",
    "while",
    "repeat",
    "until",
    "break",
    "do",
    "in",
    "self",
    "card",
    "context",
    "G",
    "SMODS",
  ]);
  return reserved.has(str);
};

const isBuiltInValue = (str: string): boolean => {
  const suitValues = new Set(SUIT_VALUES);
  const rankValues = new Set([...RANK_VALUES, ...RANK_LABELS]);
  const enhancementValues = new Set(ENHANCEMENT_VALUES());
  const editionValues = new Set(EDITION_VALUES());
  const sealValues = new Set(SEAL_VALUES());

  type SuitType = (typeof SUIT_VALUES)[number];
  type RankType = (typeof RANK_VALUES)[number] | (typeof RANK_LABELS)[number];
  type EnhancementType = string;
  type EditionType = string;
  type SealType = string;

  if (
    suitValues.has(str as SuitType) ||
    rankValues.has(str as RankType) ||
    enhancementValues.has(str as EnhancementType) ||
    editionValues.has(str as EditionType) ||
    sealValues.has(str as SealType)
  ) {
    return true;
  }

  const otherBuiltIns = new Set([
    "random",
    "none",
    "any",
    "all",
    "specific",
    "group",
    "equals",
    "not_equals",
    "greater_than",
    "less_than",
    "greater_equals",
    "less_equals",
    "contains",
    "scoring",
    "all_played",
    "face",
    "even",
    "odd",
    "red",
    "black",
    "current",
    "add",
    "subtract",
    "set",
    "increment",
    "decrement",
    "multiply",
    "divide",
    "small",
    "big",
    "boss",
    "remaining",
    "total",
    "rank",
    "suit",
    "enhancement",
    "seal",
    "edition",
    "first",
    "last",
    "left",
    "right",
    "position",
    "tarot",
    "planet",
    "spectral",
    "negative",
    "common",
    "uncommon",
    "rare",
    "legendary",
    "remove",
    "Gold",
    "Red",
    "Blue",
    "Purple",
    "T",
    "pool",
  ]);

  return otherBuiltIns.has(str);
};

export const extractVariablesFromRules = (rules: Rule[]): VariableInfo[] => {
  const variableMap = new Map<string, VariableInfo>();

  rules.forEach((rule) => {
    rule.conditionGroups.forEach((group) => {
      group.conditions.forEach((condition) => {
        if (condition.type === "internal_variable") {
          const varName = (condition.params.variable_name as string) || "var1";
          if (!variableMap.has(varName)) {
            variableMap.set(varName, {
              name: varName,
              initialValue: 0,
              usedInEffects: [],
            });
          }
        }
      });
    });

    (rule.effects || []).forEach((effect) => {
      if (effect.type === "modify_internal_variable") {
        const varName = (effect.params.variable_name as string) || "var1";
        if (!variableMap.has(varName)) {
          variableMap.set(varName, {
            name: varName,
            initialValue: 0,
            usedInEffects: [],
          });
        }
        variableMap.get(varName)!.usedInEffects.push(effect.type);
      }
    });

    (rule.randomGroups || []).forEach((group) => {
      group.effects.forEach((effect) => {
        if (effect.type === "modify_internal_variable") {
          const varName = (effect.params.variable_name as string) || "var1";
          if (!variableMap.has(varName)) {
            variableMap.set(varName, {
              name: varName,
              initialValue: 0,
              usedInEffects: [],
            });
          }
          variableMap.get(varName)!.usedInEffects.push(effect.type);
        }
      });
    });
  });

  return Array.from(variableMap.values());
};

export const generateVariableConfig = (variables: VariableInfo[]): string[] => {
  if (variables.length === 0) return [""];

  const configItems = variables.map((variable) => {
    return `${variable.name} = ${variable.initialValue}`;
  });

  return configItems
};

export const getVariableNamesFromItem = (
  item: JokerData | ConsumableData | EnhancementData | SealData | EditionData | VoucherData | DeckData
): string[] => {
  if (!item.rules) return [];

  const variableNames = new Set<string>();

  item.rules.forEach((rule) => {
    (rule.effects || []).forEach((effect) => {
      if (effect.type === "modify_internal_variable") {
        const varName = (effect.params.variable_name as string) || "var1";
        variableNames.add(varName);
      }
    });

    (rule.randomGroups || []).forEach((group) => {
      group.effects.forEach((effect) => {
        if (effect.type === "modify_internal_variable") {
          const varName = (effect.params.variable_name as string) || "var1";
          variableNames.add(varName);
        }
      });
    });

    rule.conditionGroups.forEach((group) => {
      group.conditions.forEach((condition) => {
        if (condition.type === "internal_variable") {
          const varName = (condition.params.variable_name as string) || "var1";
          variableNames.add(varName);
        }
      });
    });
  });

  return Array.from(variableNames).sort();
};

export const getVariableUsageDetails = (
  item: JokerData | ConsumableData | EnhancementData | SealData | EditionData | VoucherData | DeckData
): VariableUsage[] => {
  if (!item.rules) return [];

  const usageDetails: VariableUsage[] = [];
  const usageCount = new Map<string, number>();

  item.rules.forEach((rule, ruleIndex) => {
    (rule.effects || []).forEach((effect) => {
      if (effect.type === "modify_internal_variable") {
        const varName = (effect.params.variable_name as string) || "var1";
        const currentCount = usageCount.get(varName) || 0;
        usageCount.set(varName, currentCount + 1);

        usageDetails.push({
          variableName: varName,
          ruleId: rule.id,
          ruleIndex: ruleIndex + 1,
          type: "effect",
          itemId: effect.id,
          count: currentCount + 1,
        });
      }

      const explicitVariables = extractExplicitVariablesFromEffect(effect);
      explicitVariables.forEach((varName) => {
        const currentCount = usageCount.get(varName) || 0;
        usageCount.set(varName, currentCount + 1);

        usageDetails.push({
          variableName: varName,
          ruleId: rule.id,
          ruleIndex: ruleIndex + 1,
          type: "effect",
          itemId: effect.id,
          count: currentCount + 1,
        });
      });
    });

    (rule.randomGroups || []).forEach((group) => {
      group.effects.forEach((effect) => {
        if (effect.type === "modify_internal_variable") {
          const varName = (effect.params.variable_name as string) || "var1";
          const currentCount = usageCount.get(varName) || 0;
          usageCount.set(varName, currentCount + 1);

          usageDetails.push({
            variableName: varName,
            ruleId: rule.id,
            ruleIndex: ruleIndex + 1,
            type: "effect",
            itemId: effect.id,
            count: currentCount + 1,
          });
        }

        const explicitVariables = extractExplicitVariablesFromEffect(effect);
        explicitVariables.forEach((varName) => {
          const currentCount = usageCount.get(varName) || 0;
          usageCount.set(varName, currentCount + 1);

          usageDetails.push({
            variableName: varName,
            ruleId: rule.id,
            ruleIndex: ruleIndex + 1,
            type: "effect",
            itemId: effect.id,
            count: currentCount + 1,
          });
        });
      });
    });

    rule.conditionGroups.forEach((group) => {
      group.conditions.forEach((condition) => {
        if (condition.type === "internal_variable") {
          const varName = (condition.params.variable_name as string) || "var1";
          const currentCount = usageCount.get(varName) || 0;
          usageCount.set(varName, currentCount + 1);

          usageDetails.push({
            variableName: varName,
            ruleId: rule.id,
            ruleIndex: ruleIndex + 1,
            type: "condition",
            itemId: condition.id,
            count: currentCount + 1,
          });
        }
      });
    });
  });

  return usageDetails;
};

export const getAllVariables = (
  item: JokerData | ConsumableData | EnhancementData | SealData | EditionData | VoucherData | DeckData
): UserVariable[] => {
  // For jokers and enhancements, get user variables if they exist
  const userVars = (item as JokerData | EnhancementData).userVariables || [];
  const autoVars: UserVariable[] = [];
  const probabilityVars: UserVariable[] = [];

  if (!item.rules) {
    return userVars;
  }

  const nonPassiveRules =
    item.rules.filter((rule) => rule.trigger !== "passive") || [];

  const hasRandomGroups = nonPassiveRules.some(
    (rule) => rule.randomGroups && rule.randomGroups.length > 0
  );

  if (hasRandomGroups) {
    const randomGroups = nonPassiveRules.flatMap(
      (rule) => rule.randomGroups || []
    );
    const denominators = [
      ...new Set(randomGroups.map((group) => group.chance_denominator)),
    ];
    const numerators = [
      ...new Set(randomGroups.map((group) => group.chance_numerator)),
    ];

    if (denominators.length === 1 && numerators.length === 1) {
      probabilityVars.push({
        id: "auto_numerator",
        name: "numerator",
        initialValue: Number(numerators[0]),
        description: `Chance numerator (e.g., ${numerators[0]} in '${numerators[0]} in X')`,
      });
      probabilityVars.push({
        id: "auto_denominator",
        name: "denominator",
        initialValue: Number(denominators[0]),
        description: `Chance denominator (e.g., ${denominators[0]} in 'X in ${denominators[0]}')`,
      });
    } else if (denominators.length > 1) {
      denominators.forEach((denom, index) => {
        const numerator = numerators[Math.min(index, numerators.length - 1)];

        if (index === 0) {
          probabilityVars.push({
            id: "auto_numerator",
            name: "numerator",
            initialValue: Number(numerator),
            description: `Chance numerator (e.g., ${numerator} in '${numerator} in X')`,
          });
        } else {
          probabilityVars.push({
            id: `auto_numerator_${index + 1}`,
            name: `numerator${index + 1}`,
            initialValue: Number(numerator),
            description: `${index + 1}${getOrdinalSuffix(
              index + 1
            )} chance numerator (e.g., ${numerator} in '${numerator} in X')`,
          });
        }

        if (index === 0) {
          probabilityVars.push({
            id: "auto_denominator",
            name: "denominator",
            initialValue: Number(denom),
            description: `Chance denominator (e.g., ${denom} in 'X in ${denom}')`,
          });
        } else {
          probabilityVars.push({
            id: `auto_denominator_${index + 1}`,
            name: `denominator${index + 1}`,
            initialValue: Number(denom),
            description: `${index + 1}${getOrdinalSuffix(
              index + 1
            )} chance denominator (e.g., ${denom} in 'X in ${denom}')`,
          });
        }
      });
    } else if (numerators.length > 1) {
      numerators.forEach((num, index) => {
        const denominator =
          denominators[Math.min(index, denominators.length - 1)];

        if (index === 0) {
          probabilityVars.push({
            id: "auto_numerator",
            name: "numerator",
            initialValue: Number(num),
            description: `Chance numerator (e.g., ${num} in '${num} in X')`,
          });
        } else {
          probabilityVars.push({
            id: `auto_numerator_${index + 1}`,
            name: `numerator${index + 1}`,
            initialValue: Number(num),
            description: `${index + 1}${getOrdinalSuffix(
              index + 1
            )} chance numerator (e.g., ${num} in '${num} in X')`,
          });
        }

        if (index === 0) {
          probabilityVars.push({
            id: "auto_denominator",
            name: "denominator",
            initialValue: Number(denominator),
            description: `Chance denominator (e.g., ${denominator} in 'X in ${denominator}')`,
          });
        } else {
          probabilityVars.push({
            id: `auto_denominator_${index + 1}`,
            name: `denominator${index + 1}`,
            initialValue: Number(denominator),
            description: `${index + 1}${getOrdinalSuffix(
              index + 1
            )} chance denominator (e.g., ${denominator} in 'X in ${denominator}')`,
          });
        }
      });
    }
  }
  // For jokers, extract explicit variables (consumables/enhancements don't have these complex variables)
  let explicitVariableNames: string[] = [];
  if (item.objectType == 'joker') {
    // Check if it's a joker
    explicitVariableNames = getVariableNamesFromItem(item)
      .filter((name) => !userVars.some((uv) => uv.name === name))
      .filter(
        (name) =>
          !name.startsWith("denominator") && !name.startsWith("numerator")
      );
  }

  const otherAutoVars = explicitVariableNames.map((name) => ({
    id: `auto_${name}`,
    name,
    initialValue: getDefaultVariableValue(name),
    description: getDefaultVariableDescription(name),
  }));

  const gameVariables = extractGameVariablesFromRules(item.rules || []);
  const gameVarAutoVars = gameVariables.map((gameVar) => ({
    id: `auto_gamevar_${gameVar.id}`,
    name: gameVar.name
      .replace(/\s+/g, "")
      .replace(/^([0-9])/, "_$1") // if the name starts with a number prefix it with _
      .toLowerCase(),
    initialValue: gameVar.startsFrom,
    description: `${gameVar.description}${
      gameVar.multiplier !== 1 ? ` (×${gameVar.multiplier})` : ""
    }${gameVar.startsFrom !== 0 ? ` (starts from ${gameVar.startsFrom})` : ""}`,
  }));


  return [
    ...userVars,
    ...autoVars,
    ...otherAutoVars,
    ...gameVarAutoVars,
    ...probabilityVars,
  ];
};

const getOrdinalSuffix = (num: number): string => {
  if (num === 2) return "nd";
  if (num === 3) return "rd";
  return "th";
};

const getDefaultVariableValue = (name: string): number => {
  const defaults: Record<string, number> = {
    chips: 10,
    mult: 5,
    Xmult: 1.5,
    xchips: 1.5,
    dollars: 5,
    repetitions: 1,
    hands: 1,
    discards: 1,
    levels: 1,
    ante_value: 1,
  };
  return defaults[name] || 0;
};

const getDefaultVariableDescription = (name: string): string => {
  const descriptions: Record<string, string> = {
    chips: "Chips to add",
    mult: "Mult to add",
    Xmult: "X Mult multiplier",
    xchips: "X Chips multiplier",
    dollars: "Money to add",
    repetitions: "Card repetitions",
    hands: "Hands to modify",
    discards: "Discards to modify",
    levels: "Hand levels to add",
    ante_value: "Ante level value",
  };
  return descriptions[name] || "Custom variable";
};
