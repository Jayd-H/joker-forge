import { JokerData } from "../../data/BalatroUtils";
import {
  processPassiveEffects,
  ConfigExtraVariable,
} from "./effectUtils";
import {
  extractVariablesFromRules,
  generateVariableConfig,
  getAllVariables,
  extractGameVariablesFromRules,
} from "./variableUtils";
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
import { generateGameVariableCode, parseGameVariable, parseRangeVariable } from "./gameVariableUtils";
import { generateCalculateFunction } from "./RuleUtils";
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

export const convertRandomGroupsForCodegen = (
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

export const convertLoopGroupsForCodegen = (
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
  modprefix: string
): string => {
  const notAppearsIn: string[] = [];
  const appearsIn: string[] = [];

  const appearFlags: string[] = joker.appearFlags
    ? joker.appearFlags
        .split(",")
        .map((flag) => flag.trim())
        .filter(Boolean)
        .map((flag) => {
          const isNegated = flag.startsWith("not ");
          const rawFlag = isNegated ? flag.slice(4).trim() : flag;
          const safeFlagName = rawFlag.replace(/[^a-zA-Z0-9_]/g, "_"); // replace non-alphanumeric charactes with underscore
          const luaFlag = `G.GAME.pool_flags.${modprefix}_${safeFlagName}`;
          return isNegated ? `not ${luaFlag}` : luaFlag;
        })
    : [];

  joker.appears_in_shop = joker.appears_in_shop ?? true;
  if (joker.appears_in_shop) {
    appearsIn.push("args.source == 'sho'");
  } else {
    notAppearsIn.push("args.source ~= 'sho'");
  }

  Object.entries(joker.cardAppearance).forEach(([key, value]) => {
    if (value) {
      appearsIn.push(`args.source == '${key}'`);
    } else {
      notAppearsIn.push(`args.source ~= '${key}'`);
    }
  });

  // Check if all advanced settings are permissive (no restrictions)
  const isShopPermissive = joker.appears_in_shop !== false;
  const hasCardAppearanceRestrictions = Object.values(
    joker.cardAppearance
  ).some((value) => value === false);
  const hasAppearFlags = appearFlags.length > 0;

  // If everything is permissive (no restrictions), don't generate in_pool function
  if (isShopPermissive && !hasCardAppearanceRestrictions && !hasAppearFlags) {
    return "";
  }

  if (notAppearsIn.length > 0 || appearsIn.length > 0) {
    return `in_pool = function(self, args)
          return (
          not args 
          ${notAppearsIn.length > 0 ? "or" : ""} ${notAppearsIn.join(" and ")} 
          ${appearsIn.length > 0 ? "or" : ""} ${appearsIn.join(" or ")}
          )
          and ${appearFlags.length > 0 ? appearFlags.join(" and ") : "true"}
      end`;
  }
  return `in_pool = function(self, args)
        return ${
          joker.rarity === 4 && joker.appears_in_shop === true
            ? "true"
            : "args.source ~= 'sho'"
        }
    end`;
};

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
    display_size = {
        w = 71 * ${(joker.scale_w || 100) / 100}, 
        h = 95 * ${(joker.scale_h || 100) / 100}
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

  if (joker.pools && joker.pools.length > 0) {
    const poolsObject = joker.pools
      .map((poolName) => `["${modPrefix}_${poolName}"] = true`)
      .join(", ");

    jokerCode += `,
    pools = { ${poolsObject} }`;
  }

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

  const inPoolFunction = generateInPoolFunction(joker, modPrefix);
  if (inPoolFunction) {
    jokerCode += `,
    ${inPoolFunction}`;
  }

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
    jokerCode += `${generateUnlockFunction(joker)}`;
  }
  jokerCode += `\n}`;

  if (joker.ignoreSlotLimit) {
    jokerCode += `\n\nlocal check_for_buy_space_ref = G.FUNCS.check_for_buy_space
G.FUNCS.check_for_buy_space = function(card)
    if card.config.center.key == "j_${modPrefix}_${joker.jokerKey}" then -- ignore slot limit when bought
        return true
    end
    return check_for_buy_space_ref(card)
end

local can_select_card_ref = G.FUNCS.can_select_card
G.FUNCS.can_select_card = function(e)
	if e.config.ref_table.config.center.key == "j_${modPrefix}_${joker.jokerKey}" then
		e.config.colour = G.C.GREEN
		e.config.button = "use_card"
	else
		can_select_card_ref(e)
	end
end`;
  }

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

  return allHooks;
};
