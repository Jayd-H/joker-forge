import { JokerData } from "../../data/BalatroUtils";
import { generateTriggerContext } from "./triggerUtils";
import { generateConditionChain } from "./conditionUtils";
import {
  generateEffectReturnStatement,
  processPassiveEffects,
  ConfigExtraVariable,
} from "./effectUtils";
import {
  extractVariablesFromRules,
  generateVariableConfig,
  getAllVariables,
  extractGameVariablesFromRules,
} from "./variableUtils";
import type { Rule } from "../../ruleBuilder/types";
import type { PassiveEffectResult } from "./effectUtils";
import { generateDiscountItemsHook } from "./effects/DiscountItemsEffect";
import { generateReduceFlushStraightRequirementsHook } from "./effects/ReduceFlushStraightRequirementsEffect";
import { generateShortcutHook } from "./effects/ShortcutEffect";
import { generateShowmanHook } from "./effects/ShowmanEffect";
import { generateCombineRanksHook } from "./effects/CombineRanksEffect";
import { generateCombineSuitsHook } from "./effects/CombineSuitsEffect";
import {
  getRankId,
  getSuitByValue,
  getRankByValue,
} from "../../data/BalatroUtils";
import { slugify } from "../../data/BalatroUtils";
import { RarityData } from "../../data/BalatroUtils";
import { generateUnlockFunction } from "./unlockUtils";
import { generateIgnoreSlotLimitHook } from "./effects/IgnoreSlotLimitEffect";
interface CalculateFunctionResult {
  code: string;
  configVariables: ConfigExtraVariable[];
}

const ensureJokerKeys = (jokers: JokerData[]): JokerData[] => {
  return jokers.map((joker) => ({
    ...joker,
    jokerKey: joker.jokerKey || slugify(joker.name),
  }));
};

export const generateJokersCode = (
  jokers: JokerData[],
  atlasKey: string,
  modPrefix: string
): { jokersCode: Record<string, string>; hooks: string } => {
  const jokersWithKeys = ensureJokerKeys(jokers);
  const jokersCode: Record<string, string> = {};
  let currentPosition = 0;

  jokersWithKeys.forEach((joker) => {
    const result = generateSingleJokerCode(
      joker,
      atlasKey,
      currentPosition,
      modPrefix
    );

    let jokerCode = result.code;

    const hookCode = generateHooks([joker], modPrefix);
    if (hookCode.trim()) {
      jokerCode = `${jokerCode}

${hookCode}`;
    }

    jokersCode[`${joker.jokerKey}.lua`] = jokerCode;
    currentPosition = result.nextPosition;
  });

  return { jokersCode, hooks: "" };
};

const convertRandomGroupsForCodegen = (
  randomGroups: import("../../ruleBuilder/types").RandomGroup[]
) => {
  return randomGroups.map((group) => ({
    ...group,
    chance_numerator:
      typeof group.chance_numerator === "string" ? 1 : group.chance_numerator,
    chance_denominator:
      typeof group.chance_denominator === "string"
        ? 1
        : group.chance_denominator,
  }));
};

export const generateCustomRaritiesCode = (
  customRarities: RarityData[]
): string => {
  if (customRarities.length === 0) {
    return "";
  }

  let output = "";

  customRarities.forEach((rarity) => {
    const hexColor = rarity.badge_colour.startsWith("#")
      ? rarity.badge_colour
      : `#${rarity.badge_colour}`;

    output += `SMODS.Rarity {
    key = "${rarity.key}",
    pools = {
        ["Joker"] = true
    },
    default_weight = ${rarity.default_weight},
    badge_colour = HEX('${hexColor.substring(1)}'),
    loc_txt = {
        name = "${rarity.name}"
    },
    get_weight = function(self, weight, object_type)
        return weight
    end,
}

`;
  });

  return output.trim();
};

const generateInPoolFunction = (
  joker: JokerData,
  modprefix: string,
): string => {
  const notAppearsIn: string[] = []
  const appearsIn: string[] = []

  const appearFlags: string[] = joker.appearFlags 
  ? joker.appearFlags
    .split(",")
    .map(flag => flag.trim())
    .filter(Boolean)
    .map(flag => {
      const isNegated = flag.startsWith("not ");
      const rawFlag = isNegated ? flag.slice(4).trim() : flag
      const safeFlagName = rawFlag.replace(/[^a-zA-Z0-9_]/g, '_') // replace non-alphanumeric charactes with underscore
      const luaFlag = `G.GAME.pool_flags.${modprefix}_${safeFlagName}`;
      return isNegated ? `not ${luaFlag}` : luaFlag;
    }) 
  : [];

  joker.appears_in_shop = joker.appears_in_shop ?? true;
  joker.appears_in_shop ? appearsIn.push("args.source == 'sho'") : notAppearsIn.push("args.source ~= 'sho'")

  Object.entries(joker.cardAppearance).forEach(([key, value]) => {
    value ? appearsIn.push(`args.source == '${key}'`) : notAppearsIn.push(`args.source ~= '${key}'`)
  });

  if (notAppearsIn.length > 0 || appearsIn.length > 0) {
    return `in_pool = function(self, args)
          return (
          not args 
          ${notAppearsIn.length > 0 ? "or" : ""} ${notAppearsIn.join(" and ")} 
          ${appearsIn.length > 0 ? "or" : ""} ${appearsIn.join(" or ")}
          )
          and ${appearFlags.length > 0 ? appearFlags.join(" and ") : "true"}
      end
    `
  }
  return `
    in_pool = function(self, args)
        return ${
          joker.rarity === 4 && joker.appears_in_shop === true
            ? "true"
            : "args.source ~= 'sho'"
        }
    end`
}

const generateSingleJokerCode = (
  joker: JokerData,
  atlasKey: string,
  currentPosition: number,
  modPrefix: string
): { code: string; nextPosition: number } => {
  const passiveEffects = processPassiveEffects(joker);
  const nonPassiveRules =
    joker.rules?.filter((rule) => rule.trigger !== "passive") || [];

  let calculateResult: CalculateFunctionResult | null = null;
  if (nonPassiveRules.length > 0 || passiveEffects.length > 0) {
    calculateResult = generateCalculateFunction(
      nonPassiveRules,
      joker,
      modPrefix
    );
  }

  const configItems: string[] = [];
  const variableNameCounts = new Map<string, number>();

  const resolveVariableName = (baseName: string): string => {
    const count = variableNameCounts.get(baseName) || 0;
    variableNameCounts.set(baseName, count + 1);
    return count === 0 ? baseName : `${baseName}${count + 1}`;
  };

  passiveEffects.forEach((effect) => {
    if (effect.configVariables) {
      effect.configVariables.forEach((configVar) => {
        if (configVar.trim()) {
          configItems.push(configVar);
        }
      });
    }
  });

  if (joker.userVariables && joker.userVariables.length > 0) {
    joker.userVariables.forEach((variable) => {
      if (variable.type === "number" || !variable.type) {
        configItems.push(`${variable.name} = ${variable.initialValue || 0}`);
      }
    });
  }

  const gameVariables = extractGameVariablesFromRules(joker.rules || []);
  gameVariables.forEach((gameVar) => {
    const varName = gameVar.name
    .replace(/\s+/g, "")
    .replace(/^([0-9])/, "_$1") // if the name starts with a number prefix it with _
    .toLowerCase();
    configItems.push(`${varName} = ${gameVar.startsFrom}`);
  });

  if (calculateResult?.configVariables) {
    calculateResult.configVariables.forEach((configVar) => {
      const finalName = resolveVariableName(configVar.name);
      const valueStr =
        typeof configVar.value === "string"
          ? `"${configVar.value}"`
          : configVar.value;
      configItems.push(`${finalName} = ${valueStr}`);
    });
  }

  if (joker.rules && joker.rules.length > 0) {
    const nonPassiveRules = joker.rules.filter(
      (rule) => rule.trigger !== "passive"
    );
    const variables = extractVariablesFromRules(nonPassiveRules);

    const userVariableNames = new Set(
      joker.userVariables?.map((v) => v.name) || []
    );
    const autoVariables = variables.filter(
      (v) => !userVariableNames.has(v.name)
    );

    if (autoVariables.length > 0) {
      const variableConfig = generateVariableConfig(autoVariables);
      if (variableConfig) {
        configItems.push(variableConfig);
      }
    }
  }

  const effectsConfig = configItems.join(",\n            ");

  const jokersPerRow = 10;
  const col = currentPosition % jokersPerRow;
  const row = Math.floor(currentPosition / jokersPerRow);

  let nextPosition = currentPosition + 1;

  let jokerCode = `SMODS.Joker{ --${joker.name}
    key = "${joker.jokerKey}",
    config = {
        extra = {`;

  if (effectsConfig.trim()) {
    jokerCode += `
            ${effectsConfig}`;
  }

  jokerCode += `
        }
    },
    loc_txt = {
        ['name'] = '${joker.name}',
        ['text'] = ${formatJokerDescription(joker.description)},
        ['unlock'] = ${formatJokerDescription(joker.unlockDescription)}
    },
    pos = {
        x = ${col},
        y = ${row}
    },
    cost = ${joker.cost !== undefined ? joker.cost : 4},
    rarity = ${(() => {
      if (typeof joker.rarity === "string") {
        const prefixedRarity = modPrefix
          ? `${modPrefix}_${joker.rarity}`
          : joker.rarity;
        return `"${prefixedRarity}"`;
      } else {
        return joker.rarity;
      }
    })()},
    blueprint_compat = ${
      joker.blueprint_compat !== undefined ? joker.blueprint_compat : true
    },
    eternal_compat = ${
      joker.eternal_compat !== undefined ? joker.eternal_compat : true
    },
    perishable_compat = ${
      joker.perishable_compat !== undefined ? joker.perishable_compat : true
    },
    unlocked = ${joker.unlocked !== undefined ? joker.unlocked : true},
    discovered = ${joker.discovered !== undefined ? joker.discovered : true},
    atlas = '${atlasKey}'`;

  if (joker.overlayImagePreview) {
    const soulCol = nextPosition % jokersPerRow;
    const soulRow = Math.floor(nextPosition / jokersPerRow);

    jokerCode += `,
    soul_pos = {
        x = ${soulCol},
        y = ${soulRow}
    }`;

    nextPosition++;
  }

  
    jokerCode += `,
    ` + generateInPoolFunction(joker, modPrefix);
  

  const locVarsCode = generateLocVarsFunction(joker, passiveEffects, modPrefix);
  if (locVarsCode) {
    jokerCode += `,\n\n    ${locVarsCode}`;
  }

  const setStickerCode = generateSetAbilityFunction(joker);
  if (setStickerCode) {
    jokerCode += `,\n\n    ${setStickerCode}`;
  }

  if (calculateResult) {
    jokerCode += `,\n\n    ${calculateResult.code}`;
  }

  const addToDeckCode = passiveEffects
    .filter((effect) => effect.addToDeck)
    .map((effect) => effect.addToDeck)
    .join("\n        ");

  const removeFromDeckCode = passiveEffects
    .filter((effect) => effect.removeFromDeck)
    .map((effect) => effect.removeFromDeck)
    .join("\n        ");

  if (addToDeckCode) {
    jokerCode += `,\n\n    add_to_deck = function(self, card, from_debuff)
        ${addToDeckCode}
    end`;
  }

  if (removeFromDeckCode) {
    jokerCode += `,\n\n    remove_from_deck = function(self, card, from_debuff)
        ${removeFromDeckCode}
    end`;
  }

  if (joker.unlockTrigger) {
    jokerCode += `${generateUnlockFunction(joker)}`
  }
  jokerCode += `\n}`;

  return {
    code: jokerCode,
    nextPosition,
  };
};

export const exportSingleJoker = (joker: JokerData): void => {
  try {
    const jokerWithKey = joker.jokerKey
      ? joker
      : { ...joker, jokerKey: slugify(joker.name) };

    const result = generateSingleJokerCode(
      jokerWithKey,
      "Joker",
      0,
      "modprefix"
    );
    let jokerCode = result.code;

    const hookCode = generateHooks([jokerWithKey], "modprefix");
    if (hookCode.trim()) {
      jokerCode = `${jokerCode} 
      ${hookCode}`;
    }

    const blob = new Blob([jokerCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${jokerWithKey.jokerKey}.lua`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export joker:", error);
    throw error;
  }
};

const generateSetAbilityFunction = (joker: JokerData): string | null => {
  const forcedStickers: string[] = [];
  const suitVariables = (joker.userVariables || []).filter(
    (v) => v.type === "suit"
  );
  const rankVariables = (joker.userVariables || []).filter(
    (v) => v.type === "rank"
  );
  const pokerHandVariables = (joker.userVariables || []).filter(
    (v) => v.type === "pokerhand"
  );

  if (joker.force_eternal) {
    forcedStickers.push("card:set_eternal(true)");
  }

  if (joker.force_perishable) {
    forcedStickers.push("card:add_sticker('perishable', true)");
  }

  if (joker.force_rental) {
    forcedStickers.push("card:add_sticker('rental', true)");
  }

  const forcedEditions: string[] = [];

  if (joker.force_foil) {
    forcedEditions.push('card:set_edition("e_foil", true)');
  }

  if (joker.force_holographic) {
    forcedEditions.push('card:set_edition("e_holo", true)');
  }

  if (joker.force_polychrome) {
    forcedEditions.push('card:set_edition("e_polychrome", true)');
  }

  if (joker.force_negative) {
    forcedEditions.push('card:set_edition("e_negative", true)');
  }

  const variableInits: string[] = [];

  suitVariables.forEach((variable) => {
    const defaultSuit =
      variable.initialSuit || getSuitByValue("Spades")?.value || "Spades";
    variableInits.push(
      `G.GAME.current_round.${variable.name}_card = { suit = '${defaultSuit}' }`
    );
  });

  rankVariables.forEach((variable) => {
    const defaultRank =
      variable.initialRank || getRankByValue("A")?.label || "Ace";
    const defaultId = getRankId(defaultRank);
    variableInits.push(
      `G.GAME.current_round.${variable.name}_card = { rank = '${defaultRank}', id = ${defaultId} }`
    );
  });

  pokerHandVariables.forEach((variable) => {
    const defaultPokerHand = variable.initialPokerHand || "High Card";
    variableInits.push(
      `G.GAME.current_round.${variable.name}_hand = '${defaultPokerHand}'`
    );
  });

  if (
    forcedStickers.length === 0 &&
    variableInits.length === 0 &&
    forcedEditions.length === 0
  ) {
    return null;
  }

  const allCode = [...forcedStickers, ...variableInits, ...forcedEditions];

  return `set_ability = function(self, card, initial)
        ${allCode.join("\n        ")}
    end`;
};

const generateCalculateFunction = (
  rules: Rule[],
  joker: JokerData,
  modprefix: string
): CalculateFunctionResult => {
  const jokerKey = joker.jokerKey;
  const rulesByTrigger: Record<string, Rule[]> = {};
  rules.forEach((rule) => {
    if (!rulesByTrigger[rule.trigger]) {
      rulesByTrigger[rule.trigger] = [];
    }
    rulesByTrigger[rule.trigger].push(rule);
  });

  const allConfigVariables: ConfigExtraVariable[] = [];
  const globalEffectCounts = new Map<string, number>();

  let calculateFunction = `calculate = function(self, card, context)`;

  Object.entries(rulesByTrigger).forEach(([triggerType, triggerRules]) => {
    const sortedRules = [...triggerRules].sort((a, b) => {
      const aHasConditions = generateConditionChain(a, joker).length > 0;
      const bHasConditions = generateConditionChain(b, joker).length > 0;

      if (aHasConditions && !bHasConditions) return -1;
      if (!aHasConditions && bHasConditions) return 1;
      return 0;
    });

    const hasRetriggerEffects = sortedRules.some((rule) =>
      [
        ...(rule.effects || []),
        ...(rule.randomGroups?.flatMap((g) => g.effects) || []),
      ].some((effect) => effect.type === "retrigger_cards")
    );

    const hasDeleteEffects =
      triggerType !== "card_discarded" &&
      sortedRules.some((rule) =>
        [
          ...(rule.effects || []),
          ...(rule.randomGroups?.flatMap((g) => g.effects) || []),
        ].some((effect) => effect.type === "delete_triggered_card")
      );

    const hasFixProbablityEffects = sortedRules.some((rule) =>
      [
        ...(rule.effects || []),
        ...(rule.randomGroups?.flatMap((g) => g.effects) || []),
      ].some((effect) => effect.type === "fix_probability")
    );

    const hasModProbablityEffects = sortedRules.some((rule) =>
      [
        ...(rule.effects || []),
        ...(rule.randomGroups?.flatMap((g) => g.effects) || []),
      ].some((effect) => effect.type === "mod_probability")
    );

    const isBlueprintCompatible = rules.some(
      (rule) => rule.blueprintCompatible ?? true
    );

    if (hasDeleteEffects) {
      calculateFunction += `
        if context.destroy_card and context.destroy_card.should_destroy ${
          isBlueprintCompatible ? "" : "and not context.blueprint"
        } then
            return { remove = true }
        end`;
    }

    if (hasRetriggerEffects) {
      const retriggerContextCheck =
        triggerType === "card_held_in_hand" ||
        triggerType === "card_held_in_hand_end_of_round"
          ? `context.repetition and context.cardarea == G.hand and (next(context.card_effects[1]) or #context.card_effects > 1) ${
              isBlueprintCompatible ? "" : "and not context.blueprint"
            }`
          : `context.repetition and context.cardarea == G.play ${
              isBlueprintCompatible ? "" : "and not context.blueprint"
            }`;

      calculateFunction += `
        if ${retriggerContextCheck} then`;

      let hasAnyConditions = false;

      sortedRules.forEach((rule) => {
        const regularRetriggerEffects = (rule.effects || []).filter(
          (e) => e.type === "retrigger_cards"
        );
        const randomRetriggerEffects = (rule.randomGroups || []).filter(
          (group) => group.effects.some((e) => e.type === "retrigger_cards")
        );

        if (
          regularRetriggerEffects.length === 0 &&
          randomRetriggerEffects.length === 0
        )
          return;

        const conditionCode = generateConditionChain(rule, joker);

        if (conditionCode) {
          const conditional = hasAnyConditions ? "elseif" : "if";
          calculateFunction += `
            ${conditional} ${conditionCode} then`;
          hasAnyConditions = true;
        } else {
          if (hasAnyConditions) {
            calculateFunction += `
            else`;
          }
        }

        const effectResult = generateEffectReturnStatement(
          regularRetriggerEffects,
          convertRandomGroupsForCodegen(randomRetriggerEffects),
          triggerType,
          modprefix,
          jokerKey,
          rule.id,
          globalEffectCounts
        );

        if (effectResult.configVariables) {
          allConfigVariables.push(...effectResult.configVariables);
        }

        if (effectResult.preReturnCode) {
          calculateFunction += `
                ${effectResult.preReturnCode}`;
        }

        if (effectResult.statement) {
          calculateFunction += `
                ${effectResult.statement}`;
        }
      });

      if (hasAnyConditions) {
        calculateFunction += `
            end`;
      }

      calculateFunction += `
        end`;

      const hasNonRetriggerEffects = sortedRules.some((rule) => {
        const regularNonRetriggerEffects = (rule.effects || []).filter(
          (e) => e.type !== "retrigger_cards"
        );
        const randomNonRetriggerGroups = (rule.randomGroups || [])
          .map((group) => ({
            ...group,
            effects: group.effects.filter((e) => e.type !== "retrigger_cards"),
          }))
          .filter((group) => group.effects.length > 0);

        return (
          regularNonRetriggerEffects.length > 0 ||
          randomNonRetriggerGroups.length > 0
        );
      });

      if (hasNonRetriggerEffects) {
        const nonRetriggerContextCheck =
          triggerType === "card_held_in_hand" ||
          triggerType === "card_held_in_hand_end_of_round"
            ? `context.individual and context.cardarea == G.hand and not context.end_of_round ${
                isBlueprintCompatible ? "" : "and not context.blueprint"
              }`
            : triggerType === "card_discarded"
            ? `context.discard ${
                isBlueprintCompatible ? "" : "and not context.blueprint"
              }`
            : `context.individual and context.cardarea == G.play ${
                isBlueprintCompatible ? "" : "and not context.blueprint"
              }`;

        calculateFunction += `
        if ${nonRetriggerContextCheck} then`;

        if (hasDeleteEffects) {
          calculateFunction += `
            context.other_card.should_destroy = false`;
        }

        hasAnyConditions = false;

        const rulesWithConditions = sortedRules.filter(
          (rule) => generateConditionChain(rule, joker).length > 0
        );
        const rulesWithoutConditions = sortedRules.filter(
          (rule) => generateConditionChain(rule, joker).length === 0
        );

        rulesWithConditions.forEach((rule) => {
          const regularNonRetriggerEffects = (rule.effects || []).filter(
            (e) => e.type !== "retrigger_cards"
          );
          const randomNonRetriggerGroups = (rule.randomGroups || [])
            .map((group) => ({
              ...group,
              effects: group.effects.filter(
                (e) => e.type !== "retrigger_cards"
              ),
            }))
            .filter((group) => group.effects.length > 0);

          if (
            regularNonRetriggerEffects.length === 0 &&
            randomNonRetriggerGroups.length === 0
          )
            return;

          const conditionCode = generateConditionChain(rule, joker);

          const conditional = hasAnyConditions ? "elseif" : "if";
          calculateFunction += `
            ${conditional} ${conditionCode} then`;
          hasAnyConditions = true;

          const hasDeleteInRegularEffects = (rule.effects || []).some(
            (effect) => effect.type === "delete_triggered_card"
          );

          if (hasDeleteInRegularEffects) {
            calculateFunction += `
                context.other_card.should_destroy = true`;
          }

          const effectResult = generateEffectReturnStatement(
            regularNonRetriggerEffects,
            convertRandomGroupsForCodegen(randomNonRetriggerGroups),
            triggerType,
            modprefix,
            jokerKey,
            rule.id,
            globalEffectCounts
          );

          if (effectResult.configVariables) {
            allConfigVariables.push(...effectResult.configVariables);
          }

          if (effectResult.preReturnCode) {
            calculateFunction += `
                ${effectResult.preReturnCode}`;
          }

          if (effectResult.statement) {
            calculateFunction += `
                ${effectResult.statement}`;
          }
        });

        if (rulesWithoutConditions.length > 0) {
          const rulesWithRandomGroups = rulesWithoutConditions.filter(
            (rule) => (rule.randomGroups || []).length > 0
          );
          const rulesWithoutRandomGroups = rulesWithoutConditions.filter(
            (rule) =>
              (rule.randomGroups || []).length === 0 &&
              (rule.effects || []).length > 0
          );

          rulesWithRandomGroups.forEach((rule) => {
            const regularNonRetriggerEffects = (rule.effects || []).filter(
              (e) => e.type !== "retrigger_cards"
            );
            const randomNonRetriggerGroups = (rule.randomGroups || [])
              .map((group) => ({
                ...group,
                effects: group.effects.filter(
                  (e) => e.type !== "retrigger_cards"
                ),
              }))
              .filter((group) => group.effects.length > 0);

            if (
              regularNonRetriggerEffects.length === 0 &&
              randomNonRetriggerGroups.length === 0
            )
              return;

            const conditional = hasAnyConditions ? "elseif" : "if";
            calculateFunction += `
            ${conditional} true then`;
            hasAnyConditions = true;

            const hasDeleteInRegularEffects = (rule.effects || []).some(
              (effect) => effect.type === "delete_triggered_card"
            );

            if (hasDeleteInRegularEffects) {
              calculateFunction += `
                context.other_card.should_destroy = true`;
            }

            const effectResult = generateEffectReturnStatement(
              regularNonRetriggerEffects,
              convertRandomGroupsForCodegen(randomNonRetriggerGroups),
              triggerType,
              modprefix,
              jokerKey,
              rule.id,
              globalEffectCounts
            );

            if (effectResult.configVariables) {
              allConfigVariables.push(...effectResult.configVariables);
            }

            if (effectResult.preReturnCode) {
              calculateFunction += `
                ${effectResult.preReturnCode}`;
            }

            if (effectResult.statement) {
              calculateFunction += `
                ${effectResult.statement}`;
            }
          });

          if (rulesWithoutRandomGroups.length > 0) {
            if (hasAnyConditions) {
              calculateFunction += `
            else`;
            }

            rulesWithoutRandomGroups.forEach((rule) => {
              const regularNonRetriggerEffects = (rule.effects || []).filter(
                (e) => e.type !== "retrigger_cards"
              );

              if (regularNonRetriggerEffects.length === 0) return;

              const hasDeleteInRegularEffects = (rule.effects || []).some(
                (effect) => effect.type === "delete_triggered_card"
              );

              if (hasDeleteInRegularEffects) {
                calculateFunction += `
                context.other_card.should_destroy = true`;
              }

              const effectResult = generateEffectReturnStatement(
                regularNonRetriggerEffects,
                [],
                triggerType,
                modprefix,
                jokerKey,
                rule.id,
                globalEffectCounts
              );

              if (effectResult.configVariables) {
                allConfigVariables.push(...effectResult.configVariables);
              }

              if (effectResult.preReturnCode) {
                calculateFunction += `
                ${effectResult.preReturnCode}`;
              }

              if (effectResult.statement) {
                calculateFunction += `
                ${effectResult.statement}`;
              }
            });
          }
        }

        if (hasAnyConditions) {
          calculateFunction += `
            end`;
        }

        calculateFunction += `
        end`;
      }
    } else if (hasDeleteEffects) {
      const individualContextCheck =
        triggerType === "card_held_in_hand" ||
        triggerType === "card_held_in_hand_end_of_round"
          ? `context.individual and context.cardarea == G.hand and not context.end_of_round ${
              isBlueprintCompatible ? "" : "and not context.blueprint"
            }`
          : triggerType === "card_discarded"
          ? `context.discard ${
              isBlueprintCompatible ? "" : "and not context.blueprint"
            }`
          : `context.individual and context.cardarea == G.play ${
              isBlueprintCompatible ? "" : "and not context.blueprint"
            }`;

      calculateFunction += `
        if ${individualContextCheck} then
            context.other_card.should_destroy = false`;

      let hasAnyConditions = false;

      const rulesWithConditions = sortedRules.filter(
        (rule) => generateConditionChain(rule, joker).length > 0
      );
      const rulesWithoutConditions = sortedRules.filter(
        (rule) => generateConditionChain(rule, joker).length === 0
      );

      rulesWithConditions.forEach((rule) => {
        const regularDeleteEffects = (rule.effects || []).filter(
          (e) => e.type === "delete_triggered_card"
        );
        const randomDeleteGroups = (rule.randomGroups || []).filter((group) =>
          group.effects.some((e) => e.type === "delete_triggered_card")
        );

        const regularNonDeleteEffects = (rule.effects || []).filter(
          (e) => e.type !== "delete_triggered_card"
        );
        const randomNonDeleteGroups = (rule.randomGroups || [])
          .map((group) => ({
            ...group,
            effects: group.effects.filter(
              (e) => e.type !== "delete_triggered_card"
            ),
          }))
          .filter((group) => group.effects.length > 0);

        if (
          regularDeleteEffects.length === 0 &&
          randomDeleteGroups.length === 0 &&
          regularNonDeleteEffects.length === 0 &&
          randomNonDeleteGroups.length === 0
        )
          return;

        const conditionCode = generateConditionChain(rule, joker);

        const conditional = hasAnyConditions ? "elseif" : "if";
        calculateFunction += `
            ${conditional} ${conditionCode} then`;
        hasAnyConditions = true;

        if (regularDeleteEffects.length > 0) {
          calculateFunction += `
                context.other_card.should_destroy = true`;
        }

        const allEffects = [
          ...regularNonDeleteEffects,
          ...regularDeleteEffects,
        ];
        const allGroups = [...randomNonDeleteGroups, ...randomDeleteGroups];

        if (allEffects.length > 0 || allGroups.length > 0) {
          const effectResult = generateEffectReturnStatement(
            allEffects,
            convertRandomGroupsForCodegen(allGroups),
            triggerType,
            modprefix,
            jokerKey,
            rule.id,
            globalEffectCounts
          );

          if (effectResult.configVariables) {
            allConfigVariables.push(...effectResult.configVariables);
          }

          if (effectResult.preReturnCode) {
            calculateFunction += `
                ${effectResult.preReturnCode}`;
          }

          if (effectResult.statement) {
            calculateFunction += `
                ${effectResult.statement}`;
          }
        }
      });

      if (rulesWithoutConditions.length > 0) {
        const rulesWithRandomGroups = rulesWithoutConditions.filter(
          (rule) => (rule.randomGroups || []).length > 0
        );
        const rulesWithoutRandomGroups = rulesWithoutConditions.filter(
          (rule) =>
            (rule.randomGroups || []).length === 0 &&
            (rule.effects || []).length > 0
        );

        rulesWithRandomGroups.forEach((rule) => {
          const regularDeleteEffects = (rule.effects || []).filter(
            (e) => e.type === "delete_triggered_card"
          );
          const randomDeleteGroups = (rule.randomGroups || []).filter((group) =>
            group.effects.some((e) => e.type === "delete_triggered_card")
          );

          const regularNonDeleteEffects = (rule.effects || []).filter(
            (e) => e.type !== "delete_triggered_card"
          );
          const randomNonDeleteGroups = (rule.randomGroups || [])
            .map((group) => ({
              ...group,
              effects: group.effects.filter(
                (e) => e.type !== "delete_triggered_card"
              ),
            }))
            .filter((group) => group.effects.length > 0);

          if (
            regularDeleteEffects.length === 0 &&
            randomDeleteGroups.length === 0 &&
            regularNonDeleteEffects.length === 0 &&
            randomNonDeleteGroups.length === 0
          )
            return;

          const conditional = hasAnyConditions ? "elseif" : "if";
          calculateFunction += `
            ${conditional} true then`;
          hasAnyConditions = true;

          if (regularDeleteEffects.length > 0) {
            calculateFunction += `
                context.other_card.should_destroy = true`;
          }

          const allEffects = [
            ...regularNonDeleteEffects,
            ...regularDeleteEffects,
          ];
          const allGroups = [...randomNonDeleteGroups, ...randomDeleteGroups];

          if (allEffects.length > 0 || allGroups.length > 0) {
            const effectResult = generateEffectReturnStatement(
              allEffects,
              convertRandomGroupsForCodegen(allGroups),
              triggerType,
              modprefix,
              jokerKey,
              rule.id,
              globalEffectCounts
            );

            if (effectResult.configVariables) {
              allConfigVariables.push(...effectResult.configVariables);
            }

            if (effectResult.preReturnCode) {
              calculateFunction += `
                ${effectResult.preReturnCode}`;
            }

            if (effectResult.statement) {
              calculateFunction += `
                ${effectResult.statement}`;
            }
          }
        });

        if (rulesWithoutRandomGroups.length > 0) {
          if (hasAnyConditions) {
            calculateFunction += `
            else`;
          }

          rulesWithoutRandomGroups.forEach((rule) => {
            const regularDeleteEffects = (rule.effects || []).filter(
              (e) => e.type === "delete_triggered_card"
            );
            const regularNonDeleteEffects = (rule.effects || []).filter(
              (e) => e.type !== "delete_triggered_card"
            );

            if (
              regularDeleteEffects.length === 0 &&
              regularNonDeleteEffects.length === 0
            )
              return;

            if (regularDeleteEffects.length > 0) {
              calculateFunction += `
                context.other_card.should_destroy = true`;
            }

            const allEffects = [
              ...regularNonDeleteEffects,
              ...regularDeleteEffects,
            ];

            if (allEffects.length > 0) {
              const effectResult = generateEffectReturnStatement(
                allEffects,
                [],
                triggerType,
                modprefix,
                jokerKey,
                rule.id,
                globalEffectCounts
              );

              if (effectResult.configVariables) {
                allConfigVariables.push(...effectResult.configVariables);
              }

              if (effectResult.preReturnCode) {
                calculateFunction += `
                ${effectResult.preReturnCode}`;
              }

              if (effectResult.statement) {
                calculateFunction += `
                ${effectResult.statement}`;
              }
            }
          });
        }
      }

      if (hasAnyConditions) {
        calculateFunction += `
            end`;
      }

      calculateFunction += `
        end`;
    } else if (hasFixProbablityEffects || hasModProbablityEffects) {
      if (hasFixProbablityEffects) {
        calculateFunction += `
        if context.fix_probability ${
          isBlueprintCompatible ? "" : "and not context.blueprint"
        } then
        local numerator, denominator = context.numerator, context.denominator`;

        let hasAnyConditions = false;

        sortedRules.forEach((rule) => {
          const regularFixProbablityEffects = (rule.effects || []).filter(
            (e) => e.type === "fix_probability"
          );
          const randomFixProbablityEffects = (rule.randomGroups || []).filter(
            (group) => group.effects.some((e) => e.type === "fix_probability")
          );

          if (
            regularFixProbablityEffects.length === 0 &&
            randomFixProbablityEffects.length === 0
          )
            return;

          const conditionCode = generateConditionChain(rule, joker);

          if (conditionCode) {
            const conditional = hasAnyConditions ? "elseif" : "if";
            calculateFunction += `
            ${conditional} ${conditionCode} then`;
            hasAnyConditions = true;
          } else {
            if (hasAnyConditions) {
              calculateFunction += `
            else`;
            }
          }

          const effectResult = generateEffectReturnStatement(
            regularFixProbablityEffects,
            convertRandomGroupsForCodegen(randomFixProbablityEffects),
            triggerType,
            modprefix,
            jokerKey,
            rule.id,
            globalEffectCounts
          );

          if (effectResult.configVariables) {
            allConfigVariables.push(...effectResult.configVariables);
          }

          if (effectResult.preReturnCode) {
            calculateFunction += `
                ${effectResult.preReturnCode}`;
          }

          if (effectResult.statement) {
            calculateFunction += `
                ${effectResult.statement}`;
          }
        });

        if (hasAnyConditions) {
          calculateFunction += `
            end`;
        }

        calculateFunction += `
      return {
        numerator = numerator, 
        denominator = denominator
      }
        end`;
      }
      if (hasModProbablityEffects) {
        calculateFunction += `
          if context.mod_probability ${
            isBlueprintCompatible ? "" : "and not context.blueprint"
          } then
          local numerator, denominator = context.numerator, context.denominator`;

        let hasAnyConditions = false;

        sortedRules.forEach((rule) => {
          const regularModProbablityEffects = (rule.effects || []).filter(
            (e) => e.type === "mod_probability"
          );
          const randomModProbablityEffects = (rule.randomGroups || []).filter(
            (group) => group.effects.some((e) => e.type === "mod_probability")
          );

          if (
            regularModProbablityEffects.length === 0 &&
            randomModProbablityEffects.length === 0
          )
            return;

          const conditionCode = generateConditionChain(rule, joker);

          if (conditionCode) {
            const conditional = hasAnyConditions ? "elseif" : "if";
            calculateFunction += `
              ${conditional} ${conditionCode} then`;
            hasAnyConditions = true;
          } else {
            if (hasAnyConditions) {
              calculateFunction += `
              else`;
            }
          }

          const effectResult = generateEffectReturnStatement(
            regularModProbablityEffects,
            convertRandomGroupsForCodegen(randomModProbablityEffects),
            triggerType,
            modprefix,
            jokerKey,
            rule.id,
            globalEffectCounts
          );

          if (effectResult.configVariables) {
            allConfigVariables.push(...effectResult.configVariables);
          }

          if (effectResult.preReturnCode) {
            calculateFunction += `
                  ${effectResult.preReturnCode}`;
          }

          if (effectResult.statement) {
            calculateFunction += `
                  ${effectResult.statement}`;
          }
        });

        if (hasAnyConditions) {
          calculateFunction += `
              end`;
        }

        calculateFunction += `
        return {
          numerator = numerator, 
          denominator = denominator
        }
          end`;
      }
    } else {
      const triggerContext = generateTriggerContext(triggerType, sortedRules);

      calculateFunction += `
        if ${triggerContext.check} then`;

      let hasAnyConditions = false;

      const rulesWithConditions = sortedRules.filter(
        (rule) => generateConditionChain(rule, joker).length > 0
      );
      const rulesWithoutConditions = sortedRules.filter(
        (rule) => generateConditionChain(rule, joker).length === 0
      );

      rulesWithConditions.forEach((rule) => {
        const conditionCode = generateConditionChain(rule, joker);

        const conditional = hasAnyConditions ? "elseif" : "if";
        calculateFunction += `
            ${conditional} ${conditionCode} then`;
        hasAnyConditions = true;

        const effectResult = generateEffectReturnStatement(
          rule.effects || [],
          convertRandomGroupsForCodegen(rule.randomGroups || []),
          triggerType,
          modprefix,
          jokerKey,
          rule.id,
          globalEffectCounts
        );

        if (effectResult.configVariables) {
          allConfigVariables.push(...effectResult.configVariables);
        }

        if (effectResult.preReturnCode) {
          calculateFunction += `
                ${effectResult.preReturnCode}`;
        }

        if (effectResult.statement) {
          calculateFunction += `
                ${effectResult.statement}`;
        }
      });

      if (rulesWithoutConditions.length > 0) {
        const rulesWithRandomGroups = rulesWithoutConditions.filter(
          (rule) => (rule.randomGroups || []).length > 0
        );
        const rulesWithoutRandomGroups = rulesWithoutConditions.filter(
          (rule) =>
            (rule.randomGroups || []).length === 0 &&
            (rule.effects || []).length > 0
        );

        rulesWithRandomGroups.forEach((rule) => {
          const conditional = hasAnyConditions ? "elseif" : "if";
          calculateFunction += `
            ${conditional} true then`;
          hasAnyConditions = true;

          const effectResult = generateEffectReturnStatement(
            rule.effects || [],
            convertRandomGroupsForCodegen(rule.randomGroups || []),
            triggerType,
            modprefix,
            jokerKey,
            rule.id,
            globalEffectCounts
          );

          if (effectResult.configVariables) {
            allConfigVariables.push(...effectResult.configVariables);
          }

          if (effectResult.preReturnCode) {
            calculateFunction += `
                ${effectResult.preReturnCode}`;
          }

          if (effectResult.statement) {
            calculateFunction += `
                ${effectResult.statement}`;
          }
        });

        if (rulesWithoutRandomGroups.length > 0) {
          if (hasAnyConditions) {
            calculateFunction += `
            else`;
          }

          rulesWithoutRandomGroups.forEach((rule) => {
            const effectResult = generateEffectReturnStatement(
              rule.effects || [],
              [],
              triggerType,
              modprefix,
              jokerKey,
              rule.id,
              globalEffectCounts
            );

            if (effectResult.configVariables) {
              allConfigVariables.push(...effectResult.configVariables);
            }

            if (effectResult.preReturnCode) {
              calculateFunction += `
                ${effectResult.preReturnCode}`;
            }

            if (effectResult.statement) {
              calculateFunction += `
                ${effectResult.statement}`;
            }
          });
        }
      }

      if (hasAnyConditions) {
        calculateFunction += `
            end`;
      }

      calculateFunction += `
        end`;
    }
  });

  processPassiveEffects(joker)
    .filter((effect) => effect.calculateFunction)
    .forEach((effect) => {
      calculateFunction += `\n        ${effect.calculateFunction}`
    });


  calculateFunction += `
    end`;

  return {
    code: calculateFunction,
    configVariables: allConfigVariables,
  };
};

const generateLocVarsFunction = (
  joker: JokerData,
  passiveEffects: PassiveEffectResult[],
  modPrefix?: string
): string | null => {
  const descriptionHasVariables = joker.description.includes("#");
  if (!descriptionHasVariables) {
    return null;
  }

  const variablePlaceholders = joker.description.match(/#(\d+)#/g) || [];
  const maxVariableIndex = Math.max(
    ...variablePlaceholders.map((placeholder) =>
      parseInt(placeholder.replace(/#/g, ""))
    ),
    0
  );

  if (maxVariableIndex === 0) {
    return null;
  }

  const allVariables = getAllVariables(joker);
  const gameVariables = extractGameVariablesFromRules(joker.rules || []);
  const suitVariables = (joker.userVariables || []).filter(
    (v) => v.type === "suit"
  );
  const rankVariables = (joker.userVariables || []).filter(
    (v) => v.type === "rank"
  );
  const pokerHandVariables = (joker.userVariables || []).filter(
    (v) => v.type === "pokerhand"
  );

  const hasRandomGroups =
    joker.rules?.some(
      (rule) => rule.randomGroups && rule.randomGroups.length > 0
    ) || false;

  const variableMapping: string[] = [];
  const colorVariables: string[] = [];

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

  if (hasRandomGroups) {
    const gameVarNames = new Set(
      gameVariables.map((gv) => gv.name.replace(/\s+/g, "").toLowerCase())
    );
    const remainingVars = allVariables.filter(
      (v) =>
        v.name !== "numerator" &&
        v.name !== "denominator" &&
        !v.name.startsWith("numerator") &&
        !v.name.startsWith("denominator") &&
        v.type !== "suit" &&
        v.type !== "rank" &&
        v.type !== "pokerhand" &&
        !v.id.startsWith("auto_gamevar_") &&
        !gameVarNames.has(v.name)
    );
    const remainingGameVars = gameVariables.filter(
      (gv) =>
        !gv.name.toLowerCase().includes("numerator") &&
        !gv.name.toLowerCase().includes("denominator")
    );

    let currentIndex = 0;

    for (const variable of remainingVars) {
      if (currentIndex >= maxVariableIndex) break;
      variableMapping.push(`card.ability.extra.${variable.name}`);
      currentIndex++;
    }

    for (const gameVar of remainingGameVars) {
      if (currentIndex >= maxVariableIndex) break;
      const varName = gameVar.name
        .replace(/\s+/g, "")
        .replace(/^([0-9])/, "_$1") // if the name starts with a number prefix it with _
        .toLowerCase();
      let gameVarCode: string;

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
      currentIndex++;
    }

    for (const suitVar of suitVariables) {
      if (currentIndex >= maxVariableIndex) break;
      const defaultSuit = getSuitByValue("Spades")?.value || "Spades";
      variableMapping.push(
        `localize((G.GAME.current_round.${suitVar.name}_card or {}).suit or '${defaultSuit}', 'suits_singular')`
      );
      colorVariables.push(
        `G.C.SUITS[(G.GAME.current_round.${suitVar.name}_card or {}).suit or '${defaultSuit}']`
      );
      currentIndex++;
    }

    for (const rankVar of rankVariables) {
      if (currentIndex >= maxVariableIndex) break;
      const defaultRank = getRankByValue("A")?.label || "Ace";
      variableMapping.push(
        `localize((G.GAME.current_round.${rankVar.name}_card or {}).rank or '${defaultRank}', 'ranks')`
      );
      currentIndex++;
    }

    for (const pokerHandVar of pokerHandVariables) {
      if (currentIndex >= maxVariableIndex) break;
      variableMapping.push(
        `localize((G.GAME.current_round.${pokerHandVar.name}_hand or 'High Card'), 'poker_hands')`
      );
      currentIndex++;
    }
  } else {
    let currentIndex = 0;

    for (const variable of allVariables) {
      if (currentIndex >= maxVariableIndex) break;

      if (
        !variable.id.startsWith("auto_gamevar_") &&
        variable.type !== "suit" &&
        variable.type !== "rank" &&
        variable.type !== "pokerhand"
      ) {
        variableMapping.push(`card.ability.extra.${variable.name}`);
        currentIndex++;
      }
    }

    for (const suitVar of suitVariables) {
      if (currentIndex >= maxVariableIndex) break;
      const defaultSuit = getSuitByValue("Spades")?.value || "Spades";
      variableMapping.push(
        `localize((G.GAME.current_round.${suitVar.name}_card or {}).suit or '${defaultSuit}', 'suits_singular')`
      );
      colorVariables.push(
        `G.C.SUITS[(G.GAME.current_round.${suitVar.name}_card or {}).suit or '${defaultSuit}']`
      );
      currentIndex++;
    }

    for (const rankVar of rankVariables) {
      if (currentIndex >= maxVariableIndex) break;
      const defaultRank = getRankByValue("A")?.label || "Ace";
      variableMapping.push(
        `localize((G.GAME.current_round.${rankVar.name}_card or {}).rank or '${defaultRank}', 'ranks')`
      );
      currentIndex++;
    }

    for (const pokerHandVar of pokerHandVariables) {
      if (currentIndex >= maxVariableIndex) break;
      variableMapping.push(
        `localize((G.GAME.current_round.${pokerHandVar.name}_hand or 'High Card'), 'poker_hands')`
      );
      currentIndex++;
    }

    for (const gameVar of gameVariables) {
      if (currentIndex >= maxVariableIndex) break;
      const varName = gameVar.name
        .replace(/\s+/g, "")
        .replace(/^([0-9])/, "_$1") // if the name starts with a number prefix it with _
        .toLowerCase();
      let gameVarCode: string;

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
      currentIndex++;
    }
  }

  passiveEffects.forEach((effect) => {
    if (effect.locVars) {
      effect.locVars.forEach((locVar) => {
        if (
          !variableMapping.includes(locVar) &&
          variableMapping.length < maxVariableIndex
        ) {
          const wrappedLocVar = wrapGameVariableCode(locVar);
          variableMapping.push(wrappedLocVar);
        }
      });
    }
  });

  const finalVars = variableMapping.slice(0, maxVariableIndex);

  let locVarsReturn: string;
  let hasReturn = false;

  if (hasRandomGroups) {
    const nonPassiveRules =
      joker.rules?.filter((rule) => rule.trigger !== "passive") || [];
    const randomGroups = nonPassiveRules.flatMap(
      (rule) => rule.randomGroups || []
    );
    const denominators = [
      ...new Set(randomGroups.map((group) => group.chance_denominator)),
    ];
    const numerators = [
      ...new Set(randomGroups.map((group) => group.chance_numerator)),
    ];

    const nonProbabilityVars = finalVars.filter(
      (varName) =>
        !varName.includes("card.ability.extra.odds") &&
        !varName.includes("card.ability.extra.numerator") &&
        !varName.includes("card.ability.extra.denominator")
    );

    if (denominators.length === 1 && numerators.length === 1) {
      const oddsVar = "card.ability.extra.odds";

      locVarsReturn = `local new_numerator, new_denominator = SMODS.get_probability_vars(card, ${
        numerators[0]
      }, ${oddsVar}, 'j_${modPrefix}_${joker.jokerKey}') 
        return {vars = {${nonProbabilityVars.join(", ")}${
        nonProbabilityVars.length > 0 ? `, ` : ``
      }new_numerator, new_denominator}}`;
      hasReturn = true;
    } else if (denominators.length > 1) {
      const probabilityCalls: string[] = [];
      const probabilityVars: string[] = [];

      denominators.forEach((_, index) => {
        const oddsVar =
          index === 0
            ? "card.ability.extra.odds"
            : `card.ability.extra.odds${index + 1}`;
        const numerator = numerators[Math.min(index, numerators.length - 1)];
        const varSuffix = index === 0 ? "" : (index + 1).toString();

        probabilityCalls.push(
          `local new_numerator${varSuffix}, new_denominator${varSuffix} = SMODS.get_probability_vars(card, ${numerator}, ${oddsVar}, 'j_${modPrefix}_${joker.jokerKey}')`
        );
        probabilityVars.push(
          `new_numerator${varSuffix}`,
          `new_denominator${varSuffix}`
        );
      });

      const allReturnVars = [...nonProbabilityVars, ...probabilityVars];

      locVarsReturn = `${probabilityCalls.join("\n        ")}
        return {vars = {${allReturnVars.join(", ")}}}`;
      hasReturn = true;
    } else {
      locVarsReturn = `{vars = {${finalVars.join(", ")}}}`;
      hasReturn = false;
    }
  } else {
    locVarsReturn = `{vars = {${finalVars.join(", ")}}}`;
    hasReturn = false;
  }

  if (colorVariables.length > 0 && !hasRandomGroups) {
    const varsOnly = finalVars.join(", ");
    locVarsReturn = `{vars = {${varsOnly}}, colours = {${colorVariables.join(
      ", "
    )}}}`;
    hasReturn = false;
  }

  return `loc_vars = function(self, info_queue, card)
        ${hasReturn ? locVarsReturn : `return ${locVarsReturn}`}
    end`;
};

const formatJokerDescription = (description: string) => {
  const formatted = description.replace(/<br\s*\/?>/gi, "[s]");

  const escaped = formatted.replace(/\n/g, "[s]");
  const lines = escaped.split("[s]").map((line) => line.trim());
  // .filter((line) => line.length > 0);

  if (lines.length === 0) {
    lines.push(escaped.trim());
  }

  return `{\n${lines
    .map(
      (line, i) =>
        `            [${i + 1}] = '${line
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')
          .replace(/'/g, "\\'")}'`
    )
    .join(",\n")}\n        }`;
};

export const getEffectVariableName = (fallback: string): string => {
  return fallback;
};

const generateHooks = (jokers: JokerData[], modPrefix: string): string => {
  let allHooks = "";

  const hooksByType: Record<
    string,
    Array<{ jokerKey: string; params: unknown }>
  > = {};

  jokers.forEach((joker) => {
    const passiveEffects = processPassiveEffects(joker);

    passiveEffects.forEach((effect) => {
      if (effect.needsHook) {
        const hookType = effect.needsHook.hookType;
        if (!hooksByType[hookType]) {
          hooksByType[hookType] = [];
        }
        hooksByType[hookType].push({
          jokerKey: joker.jokerKey!,
          params: effect.needsHook.effectParams,
        });
      }
    });
  });

  if (hooksByType.discount_items) {
    allHooks += generateDiscountItemsHook(
      (
        hooksByType.discount_items as Array<{
          jokerKey: string;
          params: {
            discountType: string;
            discountMethod: string;
            discountAmount: number;
          };
        }>
      ).map((item) => ({
        ...item,
        params: {
          ...item.params,
          discountAmount: String(item.params.discountAmount),
        },
      })),
      modPrefix
    );
  }

  if (hooksByType.reduce_flush_straight_requirements) {
    allHooks += generateReduceFlushStraightRequirementsHook(
      hooksByType.reduce_flush_straight_requirements as Array<{
        jokerKey: string;
        params: {
          reductionValue: number;
        };
      }>,
      modPrefix
    );
  }

  if (hooksByType.shortcut) {
    allHooks += generateShortcutHook(
      hooksByType.shortcut as Array<{
        jokerKey: string;
        params: Record<string, unknown>;
      }>,
      modPrefix
    );
  }

  if (hooksByType.showman) {
    allHooks += generateShowmanHook(
      hooksByType.showman as Array<{
        jokerKey: string;
        params: Record<string, unknown>;
      }>,
      modPrefix
    );
  }

  if (hooksByType.combine_ranks) {
    allHooks += generateCombineRanksHook(
      hooksByType.combine_ranks as Array<{
        jokerKey: string;
        params: {
          sourceRankType: string;
          sourceRanks: string[];
          targetRank: string;
        };
      }>,
      modPrefix
    );
  }

  if (hooksByType.combine_suits) {
    allHooks += generateCombineSuitsHook(
      hooksByType.combine_suits as Array<{
        jokerKey: string;
        params: {
          suit1: string;
          suit2: string;
        };
      }>,
      modPrefix
    );
  }

  if (hooksByType.ignoreslotlimit) {
    allHooks += generateIgnoreSlotLimitHook(
      hooksByType.ignoreslotlimit as Array<{
        jokerKey: string;
        params: Record<string, unknown>;
      }>,
      modPrefix
    );
  }

  return allHooks;
};
