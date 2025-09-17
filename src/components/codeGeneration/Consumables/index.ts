import { ConsumableData } from "../../data/BalatroUtils";
import { ConsumableSetData } from "../../data/BalatroUtils";
import { generateConditionChain } from "./conditionUtils";
import { generateEffectReturnStatement } from "./effectUtils";
import { slugify } from "../../data/BalatroUtils";
import { extractGameVariablesFromRules, parseGameVariable } from "./gameVariableUtils";
import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "./gameVariableUtils";
import { parseRangeVariable } from "../Jokers/gameVariableUtils";

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
    consumableKey: consumable.consumableKey || slugify(consumable.name),
  }));
};

const convertRandomGroupsForCodegen = (
  randomGroups: import("../../ruleBuilder/types").RandomGroup[]
) => {
  return randomGroups.map((group) => ({
    ...group,
    chance_numerator:
      typeof group.chance_numerator === "string"
      ? generateGameVariableCode(group.chance_numerator)
      : group.chance_numerator,
    chance_denominator:
      typeof group.chance_denominator === "string"
        ? generateGameVariableCode(group.chance_denominator)
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
            return generateGameVariableCode(group.repetitions);
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
    consumablesCode[`${consumable.consumableKey}.lua`] = result.code;
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
        return `        ['c_${prefix}${consumable.consumableKey}'] = true`;
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

  const gameVariables = extractGameVariablesFromRules(activeRules);
  gameVariables.forEach((gameVar) => {
    const varName = gameVar.name
      .replace(/\s+/g, "")
      .replace(/^([0-9])/, "_$1") // if the name starts with a number prefix it with _
      .toLowerCase();
    configItems.push(`${varName} = ${gameVar.startsFrom}`);
  });

  activeRules.forEach((rule) => {
    const regularEffects = rule.effects || [];
    const randomGroups = convertRandomGroupsForCodegen(rule.randomGroups || []);
    const loopGroups = convertLoopGroupsForCodegen(rule.loops || []);

    const effectResult = generateEffectReturnStatement(
      regularEffects,
      randomGroups,
      loopGroups,
      modPrefix,
      consumable.consumableKey
    );

    if (effectResult.configVariables) {
      configItems.push(...effectResult.configVariables);
    }
  });

  const effectsConfig = configItems.join(",\n        ");

  const consumablesPerRow = 10;
  const col = currentPosition % consumablesPerRow;
  const row = Math.floor(currentPosition / consumablesPerRow);

  let nextPosition = currentPosition + 1;

  let consumableCode = `SMODS.Consumable {
    key = '${consumable.consumableKey}',
    set = '${consumable.set}',
    pos = { x = ${col}, y = ${row} },`;

  if (effectsConfig.trim()) {
    consumableCode += `
    config = { extra = {
        ${effectsConfig}
    } },`;
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

  const useCode = generateUseFunction(activeRules, modPrefix, consumable.consumableKey);
  if (useCode) {
    consumableCode += `
    ${useCode},`;
  }

  const canUseCode = generateCanUseFunction(activeRules, modPrefix);
  if (canUseCode) {
    consumableCode += `
    ${canUseCode},`;
  }

  consumableCode = consumableCode.replace(/,$/, "");
  consumableCode += `
}`;

  return {
    code: consumableCode,
    nextPosition,
  };
};

export const exportSingleConsumable = (consumable: ConsumableData): void => {
  try {
    const consumableWithKey = consumable.consumableKey
      ? consumable
      : { ...consumable, consumableKey: slugify(consumable.name) };

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
    a.download = `${consumableWithKey.consumableKey}.lua`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export consumable:", error);
    throw error;
  }
};

const generateUseFunction = (
  rules: Rule[],
  modPrefix: string,
  consumableKey?: string,
): string => {
  if (rules.length === 0) {
    return `use = function(self, card, area, copier)
        
    end`;
  }

  let useFunction = `use = function(self, card, area, copier)
        local used_card = copier or card`;

  rules.forEach((rule) => {
    const conditionCode = generateConditionChain(rule);

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
      modPrefix,
      consumableKey
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
    end`;

  return useFunction;
};

const generateCanUseFunction = (rules: Rule[], modPrefix: string): string => {
  if (rules.length === 0) {
    return `can_use = function(self, card)
        return true
    end`;
  }

  const ruleConditions: string[] = [];
  const customCanUseConditions: string[] = [];

  rules.forEach((rule) => {
    const conditionCode = generateConditionChain(rule);
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
      modPrefix
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
        consumable.consumableKey
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
