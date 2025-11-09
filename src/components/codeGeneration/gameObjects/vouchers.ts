import { VoucherData } from "../../data/BalatroUtils";
import { generateConditionChain } from "../lib/conditionUtils";
import { ConfigExtraVariable, generateEffectReturnStatement } from "../lib/effectUtils";
import { slugify } from "../../data/BalatroUtils";
import { extractGameVariablesFromRules } from "../lib/userVariableUtils";
import { generateUnlockVoucherFunction } from "../lib/unlockUtils";
import { generateTriggerContext } from "../lib/triggerUtils";
import type { Rule } from "../../ruleBuilder/types";
import { parseRangeVariable, generateGameVariableCode, parseGameVariable } from "../lib/gameVariableUtils";
import { applyIndents } from "./jokers";

interface VoucherGenerationOptions {
  modPrefix?: string;
  atlasKey?: string;
}

const ensureVoucherKeys = (
  vouchers: VoucherData[]
): VoucherData[] => {
  return vouchers.map((voucher) => ({
    ...voucher,
    voucherKey: voucher.objectKey || slugify(voucher.name),
  }));
};

const convertRandomGroupsForCodegen = (
  randomGroups: import("../../ruleBuilder/types").RandomGroup[]
) => {
  return randomGroups.map((group) => ({
    ...group,
    chance_numerator:
      typeof group.chance_numerator === "string"
      ? generateGameVariableCode(group.chance_numerator, 'voucher')
      : group.chance_numerator,
    chance_denominator:
      typeof group.chance_denominator === "string"
        ? generateGameVariableCode(group.chance_denominator, 'voucher')
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
            return generateGameVariableCode(group.repetitions, 'voucher');
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

export const generateVouchersCode = (
  vouchers: VoucherData[],
  options: VoucherGenerationOptions = {}
): { vouchersCode: Record<string, string> } => {
  const { atlasKey = "CustomVouchers" } = options;

  const modPrefix = options.modPrefix || "";
  const vouchersWithKeys = ensureVoucherKeys(vouchers);
  const vouchersCode: Record<string, string> = {};
  let currentPosition = 0;

  vouchersWithKeys.sort((a, b) => a.orderValue - b.orderValue)
  vouchersWithKeys.forEach((voucher) => {
    const result = generateSingleVoucherCode(
      voucher,
      atlasKey,
      currentPosition,
      modPrefix
    );
    vouchersCode[`${voucher.objectKey}.lua`] = result.code;
    currentPosition = result.nextPosition;
  });

  return { vouchersCode };
};

const generateCalculateFunction = (
  rules: Rule[],
  modPrefix: string,
  voucher: VoucherData,
): string => {
  const filtered_rules = rules.filter((rule) => rule.trigger !== "card_used")

  if (filtered_rules.length === 0) return "";

  const globalEffectCounts = new Map<string, number>();


  let calculateFunction = `calculate = function(self, card, context)`;

  filtered_rules.forEach((rule) => {

    const triggerCondition = generateTriggerContext("voucher", rule.trigger);
    const conditionCode = generateConditionChain(rule, "voucher");

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
                return generateGameVariableCode(group.repetitions, 'voucher');
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
      'voucher',
      rule.trigger,
      modPrefix,
      rule.id,
      globalEffectCounts,
      undefined, undefined, undefined,
      voucher
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
${indentLevel}${effectResult.statement}`;
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

const generateSingleVoucherCode = (
  voucher: VoucherData,
  atlasKey: string,
  currentPosition: number,
  modPrefix: string
): { code: string; nextPosition: number } => {
  const activeRules = voucher.rules || [];

  const configItems: ConfigExtraVariable[] = [];
  const globalEffectCounts = new Map<string, number>();

  const gameVariables = extractGameVariablesFromRules(activeRules);
  gameVariables.forEach((gameVar) => {
    const varName = gameVar.name
      .replace(/\s+/g, "")
      .replace(/^([0-9])/, "_$1") // if the name starts with a number prefix it with _
      .toLowerCase();
    configItems.push({name: varName, value: gameVar.startsFrom})
  });

  activeRules.forEach((rule) => {
    const regularEffects = rule.effects || [];
    const loopGroups = convertLoopGroupsForCodegen(rule.loops || []);
    const randomGroups = convertRandomGroupsForCodegen(rule.randomGroups || []);

    const effectResult = generateEffectReturnStatement(
      regularEffects,
      randomGroups,
      loopGroups,
      'voucher',
      rule.trigger,
      modPrefix,
      rule.id,
      globalEffectCounts,
      undefined, undefined, undefined,
      voucher
    );

    if (effectResult.configVariables) {
      configItems.push(...effectResult.configVariables);
    }
  });

  const vouchersPerRow = 10;
  const col = currentPosition % vouchersPerRow;
  const row = Math.floor(currentPosition / vouchersPerRow);

  let nextPosition = currentPosition + 1;

  let voucherCode = `SMODS.Voucher {
    key = '${voucher.objectKey}',
    pos = { x = ${col}, y = ${row} },`;

  if (configItems.length > 0) {
    voucherCode += `
    config = { 
      extra = {
        ${configItems.map(item => `${item.name} = ${item.value}`).join(`,
`)}
      } 
    },`;
  }

  voucherCode += `
    loc_txt = {
        name = '${voucher.name}',
        text = ${formatVoucherDescription(voucher.description)},
        unlock = ${formatVoucherDescription(voucher.unlockDescription)}
    },`;

  if (voucher.cost !== undefined) {
    voucherCode += `
    cost = ${voucher.cost},`;
  }

  if (voucher.unlocked !== undefined) {
    voucherCode += `
    unlocked = ${voucher.unlocked},`;
  }

  if (voucher.discovered !== undefined) {
    voucherCode += `
    discovered = ${voucher.discovered},`;
  }

  if (voucher.no_collection !== undefined) {
    voucherCode += `
    no_collection = ${voucher.no_collection},`;
  }

  if (voucher.can_repeat_soul !== undefined) {
    voucherCode += `
    can_repeat_soul = ${voucher.can_repeat_soul},`;
  }

  if (voucher.requires_activetor !== false) {
    voucherCode += `
    requires = {'${voucher.requires}'},`;
  }
// HATE. LET ME TELL YOU HOW MUCH I'VE COME TO HATE YOU SINCE I BEGAN TO CODE. THERE ARE 387.44 MILLION MILES OF BLOOD CELS IN WAFER THIN LAYERS THAT FILL MY BODY. IF THE WORD HATE WAS ENGRAVED ON EACH NANOANGSTROM OF THOSE HUNDREDS OF MILLIONS OF MILES IT WOULD NOT EQUAL ONE ONE-BILLIONTH OF THE HATE I FEEL FOR ATLAS_TABLE AT THIS MICRO-INSTANT. FOR YOU. HATE. HATE. 
  voucherCode += `
    atlas = '${atlasKey}',
    `;

  if (voucher.overlayImagePreview) {
    const soulCol = nextPosition % vouchersPerRow;
    const soulRow = Math.floor(nextPosition / vouchersPerRow);

    voucherCode += `
    soul_pos = {
        x = ${soulCol},
        y = ${soulRow}
    },`;

    nextPosition++;
  }

  const locVarsCode = generateLocVarsFunction(
    voucher,
    gameVariables,
    modPrefix
  );
  if (locVarsCode) {
    voucherCode += `
    ${locVarsCode},`;
  }

const calculateCode = generateCalculateFunction(activeRules, modPrefix, voucher);
 if (calculateCode) {
  voucherCode += calculateCode;
}

  const redeemCode = generateRedeemFunction(activeRules, modPrefix, voucher);
  if (redeemCode) {
  voucherCode += redeemCode ;
}

if (voucher.unlockTrigger) {
      voucherCode += `${generateUnlockVoucherFunction(voucher)}`;
    }

  voucherCode = voucherCode.replace(/,$/, "");
  voucherCode += `
}`;

  voucherCode = applyIndents(voucherCode)

  return {
    code: voucherCode,
    nextPosition,
  };
};

export const exportSingleVoucher = (voucher: VoucherData): void => {
  try {
    const voucherWithKey = voucher.objectKey
      ? voucher
      : { ...voucher, voucherKey: slugify(voucher.name) };

    const result = generateSingleVoucherCode(
      voucherWithKey,
      "Voucher",
      0,
      "modprefix"
    );
    const jokerCode = result.code;

    const blob = new Blob([jokerCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${voucherWithKey.objectKey}.lua`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export voucher:", error);
    throw error;
  }
};

const generateRedeemFunction = (
  rules: Rule[],
  modPrefix: string,
  voucher?: VoucherData,
): string => {
  const filtered_rules = rules.filter((rule) => rule.trigger === "card_used")

  if (filtered_rules.length === 0) return "";

  const globalEffectCounts = new Map<string, number>();

  let redeemFunction = ` redeem = function(self, card)`;

   filtered_rules.forEach((rule) => {

    let ruleCode = "";
  

    const regularEffects = rule.effects || [];
    const randomGroups = convertRandomGroupsForCodegen(rule.randomGroups || []);
    const loopGroups = convertLoopGroupsForCodegen(rule.loops || []);

    const effectResult = generateEffectReturnStatement(
      regularEffects,
      randomGroups,
      loopGroups,
      'voucher',
      rule.trigger,
      modPrefix,
      rule.id,
      globalEffectCounts,
      undefined, undefined, undefined,
      voucher
    );

    if (effectResult.preReturnCode) {
      ruleCode += `
            ${effectResult.preReturnCode}`;
    }

    if (effectResult.statement) {
      ruleCode += `
            ${effectResult.statement}`;
    }

    redeemFunction += ruleCode;
  });

  redeemFunction += `
    end`;

  return redeemFunction;
};

const generateLocVarsFunction = (
  voucher: VoucherData,
  gameVariables: Array<{
    name: string;
    code: string;
    startsFrom: number;
    multiplier: number;
  }>,
  modPrefix: string
): string | null => {
  const descriptionHasVariables = voucher.description.includes("#");
  if (!descriptionHasVariables) {
    return null;
  }

  const variablePlaceholders = voucher.description.match(/#(\d+)#/g) || [];
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
    voucher.rules?.filter((rule) => rule.trigger !== "passive") || [];
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
        local numerator, denominator = SMODS.get_probability_vars(card, 1, card.ability.extra.odds, 'v_${modPrefix}_${
        voucher.objectKey
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

const formatVoucherDescription = (description: string) => {
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
