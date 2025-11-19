import { ConsumableData } from "../../data/BalatroUtils";
import { ConsumableSetData } from "../../data/BalatroUtils";
import { generateConditionChain } from "../lib/conditionUtils";
import { generateEffectReturnStatement } from "../lib/effectUtils";
import { slugify } from "../../data/BalatroUtils";
import { parseGameVariable, generateGameVariableCode, parseRangeVariable } from "../lib/gameVariableUtils";
import { generateTriggerContext } from "../lib/triggerUtils";
import type { Rule } from "../../ruleBuilder/types";
import { extractGameVariablesFromRules } from "../lib/userVariableUtils";
import { applyIndents } from "./jokers";

interface ConsumableGenerationOptions {
  modPrefix?: string;
  atlasKey?: string;
  consumableSets?: ConsumableSetData[];
}

const ensureConsumableKeys = (
  consumables: ConsumableData[]
): ConsumableData[] => {
  return consumables.map((consumable) => ({
    ...consumable,
    objectKey: consumable.objectKey || slugify(consumable.name),
  }));
};

const convertRandomGroupsForCodegen = (
  randomGroups: import("../../ruleBuilder/types").RandomGroup[]
) => {
  return randomGroups.map((group) => ({
    ...group,
    chance_numerator:
      typeof group.chance_numerator === "string"
      ? generateGameVariableCode(group.chance_numerator, 'consumable')
      : group.chance_numerator,
    chance_denominator:
      typeof group.chance_denominator === "string"
        ? generateGameVariableCode(group.chance_denominator, 'consumable')
        : group.chance_denominator,
  }));
};

const convertLoopGroupsForCodegen = (
  loopGroups: import("../../ruleBuilder/types").LoopGroup[]
) => {
  return loopGroups.map((group) => ({
    ...group,
    repetitions:
      typeof group.repetitions === "string"
        ? (() => {
          const parsed = parseGameVariable(group.repetitions);
          const rangeParsed = parseRangeVariable(group.repetitions);
          if (parsed.isGameVariable) {
            return generateGameVariableCode(group.repetitions, 'consmable');
          } else if (rangeParsed.isRangeVariable) {
            const seedName = `repetitions_${group.id.substring(0, 8)}`;
            return `pseudorandom('${seedName}', ${rangeParsed.min}, ${rangeParsed.max})`;
          } else {
            return `card.ability.extra.${group.repetitions}`
          }
        })()
        : group.repetitions,
  }));
};

export const generateConsumablesCode = (
  consumables: ConsumableData[],
  options: ConsumableGenerationOptions = {}
): { consumablesCode: Record<string, string> } => {
  const { atlasKey = "CustomConsumables", consumableSets = [] } = options;

  const modPrefix = options.modPrefix || "";
  const consumablesWithKeys = ensureConsumableKeys(consumables);
  const consumablesCode: Record<string, string> = {};
  let currentPosition = 0;

  consumablesWithKeys.sort((a, b) => a.orderValue - b.orderValue)

  if (consumableSets.length > 0) {
    const setsCode = generateConsumableSetsCode(
      consumableSets,
      consumablesWithKeys,
      modPrefix
    );
    if (setsCode.trim()) {
      consumablesCode["sets.lua"] = setsCode;
    }
  }

  consumablesWithKeys.forEach((consumable) => {
    const result = generateSingleConsumableCode(
      consumable,
      atlasKey,
      currentPosition,
      modPrefix
    );
    consumablesCode[`${consumable.objectKey}.lua`] = result.code;
    currentPosition = result.nextPosition;
  });

  return { consumablesCode };
};

const generateConsumableSetsCode = (
  consumableSets: ConsumableSetData[],
  consumables: ConsumableData[],
  modPrefix: string = ""
): string => {
  let setsCode = "";

  consumableSets.forEach((set, index) => {
    if (index > 0) {
      setsCode += "\n\n";
    }

    const setConsumables = consumables.filter(
      (consumable) => consumable.set === set.key
    );

    let cardsArray = "";
    if (setConsumables.length > 0) {
      const cardEntries = setConsumables.map((consumable) => {
        const prefix = modPrefix ? `${modPrefix}_` : "";
        return `        ['c_${prefix}${consumable.objectKey}'] = true`;
      });
      cardsArray = `    cards = {
${cardEntries.join(",\n")}
    },`;
    } else {
      cardsArray = `    cards = {},`;
    }

    setsCode += `SMODS.ConsumableType {
    key = '${set.key}',`;

    const primaryColor = set.primary_colour.startsWith("#")
      ? set.primary_colour.substring(1)
      : set.primary_colour;
    const secondaryColor = set.secondary_colour.startsWith("#")
      ? set.secondary_colour.substring(1)
      : set.secondary_colour;

    setsCode += `
    primary_colour = HEX('${primaryColor}'),
    secondary_colour = HEX('${secondaryColor}'),
    collection_rows = { ${set.collection_rows[0]}, ${set.collection_rows[1]} },`;

    if (set.default_card) {
      setsCode += `
    default = '${set.default_card}',`;
    }

    if (set.shop_rate !== undefined) {
      setsCode += `
    shop_rate = ${set.shop_rate},`;
    }

    setsCode += `
${cardsArray}
    loc_txt = {
        name = "${set.name}",
        collection = "${set.collection_name || set.name + " Cards"}",
    }
}`;
  });

  return setsCode;
};

const generateSingleConsumableCode = (
  consumable: ConsumableData,
  atlasKey: string,
  currentPosition: number,
  modPrefix: string
): { code: string; nextPosition: number } => {
  const activeRules =
    consumable.rules?.filter((rule) => rule.trigger !== "passive") || [];

  const configItems: string[] = [];

  const globalEffectCounts = new Map<string, number>();

  const gameVariables = extractGameVariablesFromRules(activeRules);
  gameVariables.forEach((gameVar) => {
    const varName = gameVar.name
      .replace(/\s+/g, "")
      .replace(/^([0-9])/, "_$1") // if the name starts with a number prefix it with _
      .toLowerCase();
    configItems.push(`${varName} = ${gameVar.startsFrom}`)
  })

  activeRules.forEach((rule) => {
    const regularEffects = rule.effects || [];
    const randomGroups = convertRandomGroupsForCodegen(rule.randomGroups || []);
    const loopGroups = convertLoopGroupsForCodegen(rule.loops || []);

    const effectResult = generateEffectReturnStatement(
      regularEffects,
      randomGroups,
      loopGroups,
      'consumable',
      rule.trigger,
      modPrefix,
      rule.id,
      globalEffectCounts,
      undefined,
      consumable,
    );

    if (effectResult.configVariables) {   
      configItems.push(...effectResult.configVariables.map(item => `${item.name} = ${item.value}`));
    }
  });

  const consumablesPerRow = 10;
  const col = currentPosition % consumablesPerRow;
  const row = Math.floor(currentPosition / consumablesPerRow);

  let nextPosition = currentPosition + 1;

  let consumableCode = `SMODS.Consumable {
    key = '${consumable.objectKey}',
    set = '${consumable.set}',
    pos = { x = ${col}, y = ${row} },`;

  if (configItems.length > 0) {
    consumableCode += `
    config = { 
      extra = {
        ${configItems.join(`,\n`)}   
      } 
    },`;
  }

  consumableCode += `
    loc_txt = {
        name = '${consumable.name}',
        text = ${formatConsumableDescription(consumable)}
    },`;

  if (consumable.cost !== undefined) {
    consumableCode += `
    cost = ${consumable.cost},`;
  }

  if (consumable.unlocked !== undefined) {
    consumableCode += `
    unlocked = ${consumable.unlocked},`;
  }

  if (consumable.discovered !== undefined) {
    consumableCode += `
    discovered = ${consumable.discovered},`;
  }

  if (consumable.hidden !== undefined) {
    consumableCode += `
    hidden = ${consumable.hidden},`;
  }

  if (consumable.can_repeat_soul !== undefined) {
    consumableCode += `
    can_repeat_soul = ${consumable.can_repeat_soul},`;
  }

  consumableCode += `
    atlas = '${atlasKey}',`;

  if (consumable.overlayImagePreview) {
    const soulCol = nextPosition % consumablesPerRow;
    const soulRow = Math.floor(nextPosition / consumablesPerRow);

    consumableCode += `
    soul_pos = {
        x = ${soulCol},
        y = ${soulRow}
    },`;

    nextPosition++;
  }

  const locVarsCode = generateLocVarsFunction(
    consumable,
    gameVariables,
    modPrefix
  );
  if (locVarsCode) {
    consumableCode += `
    ${locVarsCode},`;
  }

  const calculateCode = generateCalculateFunction(activeRules, modPrefix, consumable);
  if (calculateCode) {
    consumableCode += calculateCode;
  }

  const useCode = generateUseFunction(activeRules, modPrefix, consumable);
  if (useCode) {
    consumableCode += useCode;
  }

  const canUseCode = generateCanUseFunction(activeRules, modPrefix, consumable);
  if (canUseCode) {
     consumableCode += `
    ${canUseCode},`;
  }

  consumableCode = consumableCode.replace(/,$/, "");
  consumableCode += `
}`;

  consumableCode = applyIndents(consumableCode)
  
  return {
    code: consumableCode,
    nextPosition,
  };
};

export const exportSingleConsumable = (consumable: ConsumableData): void => {
  try {
    const consumableWithKey = consumable.objectKey
      ? consumable
      : { ...consumable, objectKey: slugify(consumable.name) };

    const result = generateSingleConsumableCode(
      consumableWithKey,
      "Consumable",
      0,
      "modprefix"
    );
    const jokerCode = result.code;

    const blob = new Blob([jokerCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${consumableWithKey.objectKey}.lua`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export consumable:", error);
    throw error;
  }
};

const generateCalculateFunction = (
  rules: Rule[],
  modPrefix: string,
  consumable: ConsumableData,
): string => {

  const filtered_rules = rules.filter((rule) => rule.trigger !== "card_used")

  if (filtered_rules.length === 0) return "";

  const globalEffectCounts = new Map<string, number>();

  let calculateFunction = `
    calculate = function(self, card, context)`;

  filtered_rules.forEach((rule) => {

    const triggerCondition = generateTriggerContext('consumable', rule.trigger);
    const conditionCode = generateConditionChain(rule, "consumable");

    let ruleCode = "";

    if (triggerCondition) {
      if (
        triggerCondition
      ) {
        ruleCode += `
        if ${triggerCondition} then`;

        if (conditionCode) {
          ruleCode += `
            if ${conditionCode} then`;
        }
      } else {
        ruleCode += `
        if ${triggerCondition}`;

        if (conditionCode) {
          ruleCode += ` and ${conditionCode}`;
        }

        ruleCode += ` then`;
      }
    }

    const regularEffects = rule.effects || [];
    const randomGroups = (rule.randomGroups || []).map((group) => ({
      ...group,
      chance_numerator:
        typeof group.chance_numerator === "string" ? 1 : group.chance_numerator,
      chance_denominator:
        typeof group.chance_denominator === "string"
          ? 1
          : group.chance_denominator,
    }));
    const loopGroups = (rule.loops || []).map((group) => ({
      ...group,
      repetitions:
        typeof group.repetitions === "string"
          ? (() => {
              const parsed = parseGameVariable(group.repetitions);
              const rangeParsed = parseRangeVariable(group.repetitions);
              if (parsed.isGameVariable) {
                return generateGameVariableCode(group.repetitions, 'consumable');
              } else if (rangeParsed.isRangeVariable) {
                const seedName = `repetitions_${group.id.substring(0, 8)}`;
                return `pseudorandom('${seedName}', ${rangeParsed.min}, ${rangeParsed.max})`;
              } else {
                return `card.ability.extra.${group.repetitions}`
              }
            })()
          : group.repetitions,
    }));

    const effectResult = generateEffectReturnStatement(
      regularEffects,
      randomGroups,
      loopGroups,
      'consumable',
      rule.trigger,
      modPrefix,
      rule.id,
      globalEffectCounts,
      undefined,
      consumable
    );

    const indentLevel =
      conditionCode
        ? "                "
        : "            ";

    if (effectResult.preReturnCode) {
      ruleCode += `
${indentLevel}${effectResult.preReturnCode}`;
    }

    if (effectResult.statement) {
      ruleCode += `
${indentLevel}return {${effectResult.statement}}`;
    }

    if (triggerCondition) {
      if (
        conditionCode
      ) {
        ruleCode += `
            end`;
      }
      ruleCode += `
        end`;
    }

    calculateFunction += ruleCode;
  });

  calculateFunction += `
  end,`;

  return calculateFunction;
};

const generateUseFunction = (
  rules: Rule[],
  modPrefix: string,
  consumable?: ConsumableData,
): string => {
  const filtered_rules = rules.filter((rule) => rule.trigger === "card_used")

  if (filtered_rules.length === 0) return "";

  const globalEffectCounts = new Map<string, number>();

  let useFunction = `
  use = function(self, card, area, copier)
        local used_card = copier or card`;

  filtered_rules.forEach((rule) => {
    const conditionCode = generateConditionChain(rule, "consumable");

    let ruleCode = "";
    if (conditionCode) {
      ruleCode += `
        if ${conditionCode} then`;
    }

    const regularEffects = rule.effects || [];
    const randomGroups = convertRandomGroupsForCodegen(rule.randomGroups || []);
    const loopGroups = convertLoopGroupsForCodegen(rule.loops || []);

    const effectResult = generateEffectReturnStatement(
      regularEffects,
      randomGroups,
      loopGroups,
      'consumable',
      rule.trigger,
      modPrefix,
      rule.id,
      globalEffectCounts,
      undefined,
      consumable
    );

    if (effectResult.preReturnCode) {
      ruleCode += `
            ${effectResult.preReturnCode}`;
    }

    if (effectResult.statement) {
      ruleCode += `
            ${effectResult.statement}`;
    }

    if (conditionCode) {
      ruleCode += `
        end`;
    }

    useFunction += ruleCode;
  });

  useFunction += `
    end,`;

  return useFunction;
};

const generateCanUseFunction = (
  rules: Rule[], 
  modPrefix: string,
  consumable: ConsumableData,
): string => {
  if (rules.length === 0) {
    return `can_use = function(self, card)
        return true
    end`;
  }

  const globalEffectCounts = new Map<string, number>();

  const ruleConditions: string[] = [];
  const customCanUseConditions: string[] = [];

  rules.forEach((rule) => {
    if (rule.trigger !== "card_used") return;
    const conditionCode = generateConditionChain(rule, "consumable");
    if (conditionCode) {
      ruleConditions.push(`(${conditionCode})`);
    }

    const regularEffects = rule.effects || [];
    const randomGroups = convertRandomGroupsForCodegen(rule.randomGroups || []);
    const loopGroups = convertLoopGroupsForCodegen(rule.loops || []);

    const effectResult = generateEffectReturnStatement(
      regularEffects,
      randomGroups,
      loopGroups,
      'consumable',
      rule.trigger,
      modPrefix,
      rule.id,
      globalEffectCounts,
      undefined,
      consumable,
    );

    if (effectResult.customCanUse) {
      customCanUseConditions.push(`(${effectResult.customCanUse})`);
    }
  });

  if (ruleConditions.length === 0 && customCanUseConditions.length === 0) {
    return `can_use = function(self, card)
        return true
    end`;
  }

  let combinedCondition = "";

  if (ruleConditions.length > 0) {
    combinedCondition = ruleConditions.join(" or ");
  }

  if (customCanUseConditions.length > 0) {
    const customCondition = customCanUseConditions.join(" and ");
    if (combinedCondition) {
      combinedCondition = `(${combinedCondition}) and (${customCondition})`;
    } else {
      combinedCondition = customCondition;
    }
  }

  return `can_use = function(self, card)
        return ${combinedCondition}
    end`;
};

const generateLocVarsFunction = (
  consumable: ConsumableData,
  gameVariables: Array<{
    name: string;
    code: string;
    startsFrom: number;
    multiplier: number;
  }>,
  modPrefix: string
): string | null => {
  const descriptionHasVariables = consumable.description.includes("#");
  if (!descriptionHasVariables) {
    return null;
  }

  const variablePlaceholders = consumable.description.match(/#(\d+)#/g) || [];
  const maxVariableIndex = Math.max(
    ...variablePlaceholders.map((placeholder) =>
      parseInt(placeholder.replace(/#/g, ""))
    ),
    0
  );

  if (maxVariableIndex === 0) {
    return null;
  }

  const activeRules =
    consumable.rules?.filter((rule) => rule.trigger !== "passive") || [];
  const hasRandomGroups = activeRules.some(
    (rule) => rule.randomGroups && rule.randomGroups.length > 0
  );

  const wrapGameVariableCode = (code: string): string => {
    if (code.includes("G.jokers.cards")) {
      return code.replace(
        "G.jokers.cards",
        "(G.jokers and G.jokers.cards or {})"
      );
    }
    if (code.includes("#G.jokers.cards")) {
      return code.replace(
        "#G.jokers.cards",
        "(G.jokers and G.jokers.cards and #G.jokers.cards or 0)"
      );
    }
    if (code.includes("#G.hand.cards")) {
      return code.replace(
        "#G.hand.cards",
        "(G.hand and G.hand.cards and #G.hand.cards or 0)"
      );
    }
    if (code.includes("#G.deck.cards")) {
      return code.replace(
        "#G.deck.cards",
        "(G.deck and G.deck.cards and #G.deck.cards or 0)"
      );
    }
    if (code.includes("#G.consumeables.cards")) {
      return code.replace(
        "#G.consumeables.cards",
        "(G.consumeables and G.consumeables.cards and #G.consumeables.cards or 0)"
      );
    }
    if (
      code.includes("G.GAME") ||
      code.includes("G.jokers") ||
      code.includes("G.hand") ||
      code.includes("G.deck") ||
      code.includes("G.consumeables")
    ) {
      return `(${code} or 0)`;
    }
    return code;
  };

  const variableMapping: string[] = [];

  gameVariables.forEach((gameVar) => {
    if (variableMapping.length >= maxVariableIndex) return;

    let gameVarCode: string;
    const varName = gameVar.name
      .replace(/\s+/g, "")
      .replace(/^([0-9])/, "_$1") // if the name starts with a number prefix it with _
      .toLowerCase();
    if (gameVar.multiplier === 1 && gameVar.startsFrom === 0) {
      gameVarCode = wrapGameVariableCode(gameVar.code);
    } else if (gameVar.startsFrom === 0) {
      gameVarCode = `(${wrapGameVariableCode(gameVar.code)}) * ${
        gameVar.multiplier
      }`;
    } else if (gameVar.multiplier === 1) {
      gameVarCode = `card.ability.extra.${varName} + (${wrapGameVariableCode(
        gameVar.code
      )})`;
    } else {
      gameVarCode = `card.ability.extra.${varName} + (${wrapGameVariableCode(
        gameVar.code
      )}) * ${gameVar.multiplier}`;
    }

    variableMapping.push(gameVarCode);
  });

  if (hasRandomGroups) {
    const randomGroups = activeRules.flatMap((rule) => rule.randomGroups || []);
    const denominators = [
      ...new Set(randomGroups.map((group) => group.chance_denominator)),
    ];

    if (denominators.length === 1) {
      return `loc_vars = function(self, info_queue, card)
        local numerator, denominator = SMODS.get_probability_vars(card, 1, card.ability.extra.odds, 'c_${modPrefix}_${
        consumable.objectKey
      }')
        return {vars = {${variableMapping.join(", ")}${
        variableMapping.length > 0 ? ", " : ""
      }numerator, denominator}}
    end`;
    } else {
      const probabilityVars: string[] = [];
      denominators.forEach((index) => {
        const varName =
          index === 0
            ? "card.ability.extra.odds"
            : `card.ability.extra.odds${Number(index) + 1}`;
        probabilityVars.push(varName);
      });

      return `loc_vars = function(self, info_queue, card)
        return {vars = {${[...variableMapping, ...probabilityVars]
          .slice(0, maxVariableIndex)
          .join(", ")}}}
    end`;
    }
  }

  const finalVars = variableMapping.slice(0, maxVariableIndex);

  return `loc_vars = function(self, info_queue, card)
        return {vars = {${finalVars.join(", ")}}}
    end`;
};

const formatConsumableDescription = (consumable: ConsumableData): string => {
  const formatted = consumable.description.replace(/<br\s*\/?>/gi, "[s]");

  const escaped = formatted.replace(/\n/g, "[s]");
  const lines = escaped.split("[s]").map((line) => line.trim());

  if (lines.length === 0) {
    lines.push(escaped.trim());
  }

  return `{
${lines
  .map(
    (line, i) =>
      `        [${i + 1}] = '${line
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/'/g, "\\'")}'`
  )
  .join(",\n")}
    }`;
};
