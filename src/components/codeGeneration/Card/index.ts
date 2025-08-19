import { EnhancementData, SealData, slugify } from "../../data/BalatroUtils";
import { generateConditionChain } from "./conditionUtils";
import { generateEffectReturnStatement } from "./effectUtils";
import { generateTriggerCondition } from "./triggerUtils";
import { extractGameVariablesFromRules } from "../Consumables/gameVariableUtils";
import type { Rule, Effect } from "../../ruleBuilder/types";

interface EnhancementGenerationOptions {
  modPrefix?: string;
  atlasKey?: string;
}

interface SealGenerationOptions {
  modPrefix?: string;
  atlasKey?: string;
}

interface UnconditionalEffect {
  trigger: string;
  effect: Effect;
}

const hasRetriggerEffects = (rules: Rule[]): boolean => {
  return rules.some(
    (rule) =>
      rule.effects?.some((effect) => effect.type === "retrigger_card") ||
      rule.randomGroups?.some((group) =>
        group.effects.some((effect) => effect.type === "retrigger_card")
      )
  );
};

const hasDestroyCardEffects = (rules: Rule[]): boolean => {
  return rules.some(
    (rule) =>
      rule.effects?.some((effect) => effect.type === "destroy_card") ||
      rule.randomGroups?.some((group) =>
        group.effects.some((effect) => effect.type === "destroy_card")
      )
  );
};

const hasNonDiscardDestroyEffects = (rules: Rule[]): boolean => {
  return rules.some(
    (rule) =>
      rule.trigger !== "card_discarded" &&
      (rule.effects?.some((effect) => effect.type === "destroy_card") ||
        rule.randomGroups?.some((group) =>
          group.effects.some((effect) => effect.type === "destroy_card")
        ))
  );
};

const generateCalculateFunction = (
  rules: Rule[],
  modPrefix: string,
  hasNonDiscardDestroy: boolean,
  hasRetrigger: boolean,
  itemType: "enhancement" | "seal"
): string => {
  if (rules.length === 0 && !hasNonDiscardDestroy && !hasRetrigger) {
    return "";
  }

  const abilityPath =
    itemType === "seal" ? "card.ability.seal.extra" : "card.ability.extra";

  let calculateFunction = `calculate = function(self, card, context)`;

  if (hasNonDiscardDestroy) {
    if (itemType === "enhancement") {
      calculateFunction += `
        if context.destroy_card and context.cardarea == G.play and context.destroy_card == card and card.should_destroy then
            return { remove = true }
        end`;
    } else {
      calculateFunction += `
        if context.destroy_card and context.cardarea == G.play and context.destroy_card == card and card.should_destroy then
            G.E_MANAGER:add_event(Event({
                func = function()
                    card:start_dissolve()
                    return true
                end
            }))
            card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = "Card Destroyed!", colour = G.C.RED})
            return
        end`;
    }
  }

  if (hasRetrigger) {
    calculateFunction += `
        if context.repetition and card.should_retrigger then
            return { repetitions = ${abilityPath}.retrigger_times }
        end`;
  }

  rules.forEach((rule) => {
    const triggerCondition = generateTriggerCondition(rule.trigger);
    const conditionCode = generateConditionChain(rule);

    const ruleHasDestroyCardEffects =
      rule.effects?.some((effect) => effect.type === "destroy_card") ||
      rule.randomGroups?.some((group) =>
        group.effects.some((effect) => effect.type === "destroy_card")
      );

    const ruleHasRetriggerEffects =
      rule.effects?.some((effect) => effect.type === "retrigger_card") ||
      rule.randomGroups?.some((group) =>
        group.effects.some((effect) => effect.type === "retrigger_card")
      );

    const isDiscardTrigger = rule.trigger === "card_discarded";

    let ruleCode = "";

    if (triggerCondition) {
      if (
        (ruleHasDestroyCardEffects || ruleHasRetriggerEffects) &&
        !isDiscardTrigger
      ) {
        ruleCode += `
        if ${triggerCondition} then`;

        if (ruleHasDestroyCardEffects) {
          ruleCode += `
            card.should_destroy = false`;
        }

        if (ruleHasRetriggerEffects) {
          ruleCode += `
            card.should_retrigger = false`;
        }

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

    const effectResult = generateEffectReturnStatement(
      regularEffects,
      randomGroups,
      modPrefix,
      rule.trigger,
      itemType
    );

    const indentLevel =
      (ruleHasDestroyCardEffects || ruleHasRetriggerEffects) &&
      !isDiscardTrigger &&
      conditionCode
        ? "                "
        : "            ";

    if (effectResult.preReturnCode) {
      ruleCode += `
${indentLevel}${effectResult.preReturnCode}`;
    }

    if (effectResult.statement) {
      ruleCode += `
${indentLevel}return ${effectResult.statement}`;
    }

    if (triggerCondition) {
      if (
        (ruleHasDestroyCardEffects || ruleHasRetriggerEffects) &&
        !isDiscardTrigger &&
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
    end`;

  return calculateFunction;
};

const generateLocVarsFunction = (
  item: EnhancementData | SealData,
  gameVariables: Array<{
    name: string;
    code: string;
    startsFrom: number;
    multiplier: number;
  }>,
  modPrefix: string,
  itemType: "enhancement" | "seal",
  unconditionalEffects: UnconditionalEffect[] = []
): string | null => {
  const descriptionHasVariables = item.description.includes("#");
  if (!descriptionHasVariables) {
    return null;
  }

  const variablePlaceholders = item.description.match(/#(\d+)#/g) || [];
  const maxVariableIndex = Math.max(
    ...variablePlaceholders.map((placeholder) =>
      parseInt(placeholder.replace(/#/g, ""))
    ),
    0
  );

  if (maxVariableIndex === 0) {
    return null;
  }

  const activeRules = item.rules || [];
  const hasRandomGroups = activeRules.some(
    (rule) => rule.randomGroups && rule.randomGroups.length > 0
  );

  const abilityPath =
    itemType === "seal" ? "card.ability.seal.extra" : "card.ability.extra";

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

  if (itemType === "enhancement") {
    const getDefaultEffectValue = (effectType: string): number => {
      switch (effectType) {
        case "add_mult":
          return 4;
        case "add_chips":
          return 30;
        case "edit_dollars":
          return 1;
        default:
          return 0;
      }
    };

    unconditionalEffects.forEach((unconditionalEffect) => {
      if (variableMapping.length >= maxVariableIndex) return;

      const value =
        (unconditionalEffect.effect.params?.value as number) ||
        getDefaultEffectValue(unconditionalEffect.effect.type);
      variableMapping.push(value.toString());
    });
  }

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
      gameVarCode = `${abilityPath}.${varName} + (${wrapGameVariableCode(
        gameVar.code
      )})`;
    } else {
      gameVarCode = `${abilityPath}.${varName} + (${wrapGameVariableCode(
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
      const keyPrefix =
        itemType === "enhancement" ? `m_${modPrefix}` : modPrefix;
      const itemKey =
        itemType === "enhancement"
          ? (item as EnhancementData).enhancementKey
          : (item as SealData).sealKey;

      return `loc_vars = function(self, info_queue, card)
        local numerator, denominator = SMODS.get_probability_vars(card, 1, ${abilityPath}.odds, '${keyPrefix}_${itemKey}')
        return {vars = {${variableMapping.join(", ")}${
        variableMapping.length > 0 ? ", " : ""
      }numerator, denominator}}
    end`;
    } else {
      const probabilityVars: string[] = [];
      denominators.forEach((index) => {
        const varName =
          index === 0
            ? `${abilityPath}.odds`
            : `${abilityPath}.odds${Number(index) + 1}`;
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

export const generateEnhancementsCode = (
  enhancements: EnhancementData[],
  options: EnhancementGenerationOptions = {}
): { enhancementsCode: Record<string, string> } => {
  const { modPrefix = "", atlasKey = "CustomEnhancements" } = options;

  const enhancementsWithKeys = enhancements.map((enhancement) => ({
    ...enhancement,
    enhancementKey: enhancement.enhancementKey || slugify(enhancement.name),
  }));

  const enhancementsCode: Record<string, string> = {};
  let currentPosition = 0;

  enhancementsWithKeys.forEach((enhancement) => {
    const result = generateSingleEnhancementCode(
      enhancement,
      atlasKey,
      currentPosition,
      modPrefix
    );
    enhancementsCode[`${enhancement.enhancementKey}.lua`] = result.code;
    currentPosition = result.nextPosition;
  });

  return { enhancementsCode };
};

export const generateSealsCode = (
  seals: SealData[],
  options: SealGenerationOptions = {}
): { sealsCode: Record<string, string> } => {
  const { modPrefix = "", atlasKey = "CustomSeals" } = options;

  const sealsWithKeys = seals.map((seal) => ({
    ...seal,
    sealKey: seal.sealKey || slugify(seal.name),
  }));

  const sealsCode: Record<string, string> = {};
  let currentPosition = 0;

  sealsWithKeys.forEach((seal) => {
    const result = generateSingleSealCode(
      seal,
      atlasKey,
      currentPosition,
      modPrefix
    );
    sealsCode[`${seal.sealKey}.lua`] = result.code;
    currentPosition = result.nextPosition;
  });

  return { sealsCode };
};

const generateSingleEnhancementCode = (
  enhancement: EnhancementData,
  atlasKey: string,
  currentPosition: number,
  modPrefix: string
): { code: string; nextPosition: number } => {
  const activeRules = enhancement.rules || [];

  const hasNonDiscardDestroy = hasNonDiscardDestroyEffects(activeRules);
  const hasRetrigger = hasRetriggerEffects(activeRules);

  const isUnconditionalRule = (rule: Rule): boolean => {
    return (
      !rule.conditionGroups ||
      rule.conditionGroups.length === 0 ||
      rule.conditionGroups.every(
        (group) => !group.conditions || group.conditions.length === 0
      )
    );
  };

  const allowsBaseConfigConversion = (trigger: string): boolean => {
    return trigger === "card_scored" || trigger === "card_held";
  };

  const isSimpleEffect = (effect: Effect): boolean => {
    const allowedTypes = ["add_mult", "add_chips", "edit_dollars"];
    if (!allowedTypes.includes(effect.type)) {
      return false;
    }

    if (effect.type === "edit_dollars") {
      const operation = (effect.params?.operation as string) || "add";
      if (operation !== "add") {
        return false;
      }
    }

    const value = effect.params?.value;

    if (value === undefined || value === null) {
      return true;
    }

    if (typeof value === "number") {
      return true;
    }

    if (typeof value === "string") {
      if (value.includes("GAMEVAR:") || value.includes("RANGE:")) {
        return false;
      }

      if (value.includes("_value") || value.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
        return false;
      }

      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        return true;
      }

      return false;
    }

    return false;
  };

  const unconditionalEffects: UnconditionalEffect[] = [];
  activeRules.forEach((rule) => {
    if (
      isUnconditionalRule(rule) &&
      allowsBaseConfigConversion(rule.trigger) &&
      rule.effects
    ) {
      rule.effects.forEach((effect) => {
        if (isSimpleEffect(effect)) {
          unconditionalEffects.push({
            trigger: rule.trigger,
            effect: effect,
          });
        }
      });
    }
  });

  const baseConfig: Record<string, number> = {};
  unconditionalEffects.forEach(({ trigger, effect }) => {
    const getDefaultEffectValue = (effectType: string): number => {
      switch (effectType) {
        case "add_mult":
          return 4;
        case "add_chips":
          return 30;
        case "edit_dollars":
          return 1;
        default:
          return 0;
      }
    };

    let value: number;
    if (effect.params?.value === undefined || effect.params?.value === null) {
      value = getDefaultEffectValue(effect.type);
    } else if (typeof effect.params.value === "number") {
      value = effect.params.value;
    } else if (typeof effect.params.value === "string") {
      const numValue = parseFloat(effect.params.value);
      if (!isNaN(numValue)) {
        value = numValue;
      } else {
        console.warn(
          `Unexpected non-numeric value in simple effect: ${effect.params.value}`
        );
        value = getDefaultEffectValue(effect.type);
      }
    } else {
      value = getDefaultEffectValue(effect.type);
    }

    switch (effect.type) {
      case "add_chips":
        if (trigger === "card_scored") {
          baseConfig.bonus = (baseConfig.bonus || 0) + value;
        } else if (trigger === "card_held") {
          baseConfig.h_chips = (baseConfig.h_chips || 0) + value;
        }
        break;

      case "add_mult":
        if (trigger === "card_scored") {
          baseConfig.mult = (baseConfig.mult || 0) + value;
        } else if (trigger === "card_held") {
          baseConfig.h_mult = (baseConfig.h_mult || 0) + value;
        }
        break;

      case "edit_dollars": {
        const operation = (effect.params?.operation as string) || "add";
        if (operation === "add") {
          if (trigger === "card_scored") {
            baseConfig.p_dollars = (baseConfig.p_dollars || 0) + value;
          } else if (trigger === "card_held") {
            baseConfig.h_dollars = (baseConfig.h_dollars || 0) + value;
          }
        }
        break;
      }
    }
  });

  const conditionalRules = activeRules
    .map((rule) => {
      const conditionalEffects = rule.effects?.filter(
        (effect) =>
          !isSimpleEffect(effect) ||
          !isUnconditionalRule(rule) ||
          !allowsBaseConfigConversion(rule.trigger)
      );

      if (
        !isUnconditionalRule(rule) ||
        !allowsBaseConfigConversion(rule.trigger)
      ) {
        return rule;
      }

      if (rule.randomGroups && rule.randomGroups.length > 0) {
        return {
          ...rule,
          effects: conditionalEffects || [],
        };
      }

      if (conditionalEffects && conditionalEffects.length > 0) {
        return {
          ...rule,
          effects: conditionalEffects,
        };
      }

      return null;
    })
    .filter(
      (rule): rule is Rule =>
        rule !== null &&
        (!isUnconditionalRule(rule) ||
          !allowsBaseConfigConversion(rule.trigger) ||
          (rule.effects && rule.effects.length > 0) ||
          (rule.randomGroups && rule.randomGroups.length > 0))
    );

  const configItems: string[] = [];

  const gameVariables = extractGameVariablesFromRules(activeRules);
  gameVariables.forEach((gameVar) => {
    const varName = gameVar.name
      .replace(/\s+/g, "")
      .replace(/^([0-9])/, "_$1") // if the name starts with a number prefix it with _
      .toLowerCase();
    configItems.push(`${varName} = ${gameVar.startsFrom}`);
  });

  if (enhancement.userVariables && enhancement.userVariables.length > 0) {
    enhancement.userVariables.forEach((variable) => {
      if (variable.type === "number" || !variable.type) {
        configItems.push(`${variable.name} = ${variable.initialValue || 0}`);
      }
    });
  }

  conditionalRules.forEach((rule) => {
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

    const effectResult = generateEffectReturnStatement(
      regularEffects,
      randomGroups,
      modPrefix,
      rule.trigger,
      "enhancement"
    );

    if (effectResult.configVariables) {
      configItems.push(...effectResult.configVariables);
    }
  });

  const enhancementsPerRow = 10;
  const col = currentPosition % enhancementsPerRow;
  const row = Math.floor(currentPosition / enhancementsPerRow);

  const nextPosition = currentPosition + 1;

  let enhancementCode = `SMODS.Enhancement {
    key = '${enhancement.enhancementKey}',
    pos = { x = ${col}, y = ${row} },`;

  const hasBaseConfig = Object.keys(baseConfig).length > 0;
  const hasExtraConfig = configItems.length > 0;

  if (hasBaseConfig || hasExtraConfig) {
    enhancementCode += `
    config = {`;

    Object.entries(baseConfig).forEach(([key, value]) => {
      enhancementCode += `
        ${key} = ${value},`;
    });

    if (hasExtraConfig) {
      enhancementCode += `
        extra = {
            ${configItems.join(",\n            ")}
        }`;
    }

    enhancementCode = enhancementCode.replace(/,$/, "");
    enhancementCode += `
    },`;
  }

  enhancementCode += `
    loc_txt = {
        name = '${enhancement.name}',
        text = ${formatEnhancementDescription(enhancement)}
    },`;

  if (enhancement.atlas) {
    enhancementCode += `
    atlas = '${enhancement.atlas}',`;
  } else {
    enhancementCode += `
    atlas = '${atlasKey}',`;
  }

  if (enhancement.any_suit !== undefined) {
    enhancementCode += `
    any_suit = ${enhancement.any_suit},`;
  }

  if (hasDestroyCardEffects(activeRules)) {
    enhancementCode += `
    shatters = true,`;
  }

  if (enhancement.replace_base_card !== undefined) {
    enhancementCode += `
    replace_base_card = ${enhancement.replace_base_card},`;
  }

  if (enhancement.no_rank !== undefined) {
    enhancementCode += `
    no_rank = ${enhancement.no_rank},`;
  }

  if (enhancement.no_suit !== undefined) {
    enhancementCode += `
    no_suit = ${enhancement.no_suit},`;
  }

  if (enhancement.always_scores !== undefined) {
    enhancementCode += `
    always_scores = ${enhancement.always_scores},`;
  }

  if (enhancement.unlocked !== undefined) {
    enhancementCode += `
    unlocked = ${enhancement.unlocked},`;
  }

  if (enhancement.discovered !== undefined) {
    enhancementCode += `
    discovered = ${enhancement.discovered},`;
  }

  if (enhancement.no_collection !== undefined) {
    enhancementCode += `
    no_collection = ${enhancement.no_collection},`;
  }

  const locVarsCode = generateLocVarsFunction(
    enhancement,
    gameVariables,
    modPrefix,
    "enhancement",
    unconditionalEffects
  );
  if (locVarsCode) {
    enhancementCode += `
    ${locVarsCode},`;
  }

  const calculateCode = generateCalculateFunction(
    conditionalRules,
    modPrefix,
    hasNonDiscardDestroy,
    hasRetrigger,
    "enhancement"
  );
  if (calculateCode) {
    enhancementCode += `
    ${calculateCode},`;
  }

  enhancementCode = enhancementCode.replace(/,$/, "");
  enhancementCode += `
}`;

  return {
    code: enhancementCode,
    nextPosition,
  };
};

const generateSingleSealCode = (
  seal: SealData,
  atlasKey: string,
  currentPosition: number,
  modPrefix: string
): { code: string; nextPosition: number } => {
  const activeRules = seal.rules || [];

  const hasNonDiscardDestroy = hasNonDiscardDestroyEffects(activeRules);
  const hasRetrigger = hasRetriggerEffects(activeRules);

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
    const randomGroups = (rule.randomGroups || []).map((group) => ({
      ...group,
      chance_numerator:
        typeof group.chance_numerator === "string" ? 1 : group.chance_numerator,
      chance_denominator:
        typeof group.chance_denominator === "string"
          ? 1
          : group.chance_denominator,
    }));

    const effectResult = generateEffectReturnStatement(
      regularEffects,
      randomGroups,
      modPrefix,
      rule.trigger,
      "seal"
    );

    if (effectResult.configVariables) {
      configItems.push(...effectResult.configVariables);
    }
  });

  if (seal.userVariables && seal.userVariables.length > 0) {
    seal.userVariables.forEach((variable) => {
      if (variable.type === "number" || !variable.type) {
        configItems.push(`${variable.name} = ${variable.initialValue || 0}`);
      }
    });
  }

  const sealsPerRow = 10;
  const col = currentPosition % sealsPerRow;
  const row = Math.floor(currentPosition / sealsPerRow);

  const nextPosition = currentPosition + 1;

  let sealCode = `SMODS.Seal {
    key = '${seal.sealKey}',
    pos = { x = ${col}, y = ${row} },`;

  const hasExtraConfig = configItems.length > 0;

  if (hasExtraConfig) {
    sealCode += `
    config = {
        extra = {
            ${configItems.join(",\n            ")}
        }
    },`;
  }

  if (seal.badge_colour && seal.badge_colour !== "#FFFFFF") {
    sealCode += `
    badge_colour = HEX('${seal.badge_colour.replace("#", "")}'),`;
  }

  sealCode += `
   loc_txt = {
        name = '${seal.name}',
        label = '${seal.name}',
        text = ${formatSealDescription(seal)}
    },`;

  if (seal.atlas) {
    sealCode += `
    atlas = '${seal.atlas}',`;
  } else {
    sealCode += `
    atlas = '${atlasKey}',`;
  }

  if (seal.unlocked !== undefined) {
    sealCode += `
    unlocked = ${seal.unlocked},`;
  }

  if (seal.discovered !== undefined) {
    sealCode += `
    discovered = ${seal.discovered},`;
  }

  if (seal.no_collection !== undefined) {
    sealCode += `
    no_collection = ${seal.no_collection},`;
  }

  const locVarsCode = generateLocVarsFunction(
    seal,
    gameVariables,
    modPrefix,
    "seal"
  );
  if (locVarsCode) {
    sealCode += `
    ${locVarsCode},`;
  }

  const calculateCode = generateCalculateFunction(
    activeRules,
    modPrefix,
    hasNonDiscardDestroy,
    hasRetrigger,
    "seal"
  );
  if (calculateCode) {
    sealCode += `
    ${calculateCode},`;
  }

  sealCode = sealCode.replace(/,$/, "");
  sealCode += `
}`;

  return {
    code: sealCode,
    nextPosition,
  };
};

export const exportSingleEnhancement = (enhancement: EnhancementData): void => {
  try {
    const enhancementWithKey = enhancement.enhancementKey
      ? enhancement
      : { ...enhancement, enhancementKey: slugify(enhancement.name) };

    const result = generateSingleEnhancementCode(
      enhancementWithKey,
      "Enhancement",
      0,
      "modprefix"
    );
    const enhancementCode = result.code;

    const blob = new Blob([enhancementCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${enhancementWithKey.enhancementKey}.lua`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export enhancement:", error);
    throw error;
  }
};

export const exportSingleSeal = (seal: SealData): void => {
  try {
    const sealWithKey = seal.sealKey
      ? seal
      : { ...seal, sealKey: slugify(seal.name) };

    const result = generateSingleSealCode(sealWithKey, "Seal", 0, "modprefix");
    const sealCode = result.code;

    const blob = new Blob([sealCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sealWithKey.sealKey}.lua`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export seal:", error);
    throw error;
  }
};

function formatEnhancementDescription(enhancement: EnhancementData): string {
  const formatted = enhancement.description.replace(/<br\s*\/?>/gi, "[s]");
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
}

function formatSealDescription(seal: SealData): string {
  const formatted = seal.description.replace(/<br\s*\/?>/gi, "[s]");
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
}
