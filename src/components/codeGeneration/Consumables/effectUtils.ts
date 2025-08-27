import type { Effect, RandomGroup } from "../../ruleBuilder/types";
import { generateLevelUpHandReturn } from "./effects/LevelUpHandEffect";
import { generateDestroySelectedCardsReturn } from "./effects/DestroySelectedCardsEffect";
import { generateDestroyRandomCardsReturn } from "./effects/DestroyRandomCardsEffect";
import { generateDoubleDollarsReturn } from "./effects/DoubleDollarsEffect";
import { generateAddDollarsFromJokersReturn } from "./effects/AddDollarsFromJokersEffect";
import { generateCreateConsumableReturn } from "./effects/CreateConsumableEffect";
import { generateEditHandSizeReturn } from "./effects/EditHandSizeEffect";
import { generateEditHandsReturn } from "./effects/EditHandsEffect";
import { generateEditDiscardsReturn } from "./effects/EditDiscardsEffect";
import { generateConvertAllCardsToSuitReturn } from "./effects/ConvertAllCardsToSuitEffect";
import { generateConvertAllCardsToRankReturn } from "./effects/ConvertAllCardsToRankEffect";
import { generateEditCardsReturn } from "./effects/EditCardsEffect";
import { generateEditCardsInHandReturn } from "./effects/EditCardsInHandEffect";
import { generateCreateJokerReturn } from "./effects/CreateJokerEffect";
import { generateIncrementRankReturn } from "./effects/IncrementRankEffect";
import { generateAddCardsToHandReturn } from "./effects/AddCardsToHandEffect";
import { generateEditDollarsReturn } from "./effects/EditDollarsEffect";
import { generateCopyRandomJokerReturn } from "./effects/CopyRandomJokerEffect";
import { generateDestroyRandomJokerReturn } from "./effects/DestroyRandomJokerEffect";
import { generateEditionRandomJokerReturn } from "./effects/EditionRandomJokerEffect";
import { generateCopySelectedCardsReturn } from "./effects/CopySelectedCardsEffect";
import { generateConvertLeftToRightReturn } from "./effects/ConvertLeftToRightEffect";
import { generateFoolEffectReturn } from "./effects/FoolEffect";
import { generateDrawCardsReturn } from "./effects/DrawCardsEffect";
import { generateEditPlaySizeReturn } from "./effects/EditPlaySizeEffect";
import { generateEditDiscardSizeReturn } from "./effects/EditDiscardSizeEffect";
import { generateEditBoosterSlotsReturn } from "./effects/EditBoosterSlotsEffect";
import { generateEditVoucherSlotsReturn } from "./effects/EditVoucherSlotsEffect";
import { generateCreateTagReturn } from "./effects/CreateTagEffect";
import { generatePermaBonusReturn } from "./effects/PermaBonusEffect";
import { generateEditJokerSlotsReturn } from "./effects/EditJokerSlotsEffect";
import { generateDestroyConsumableReturn } from "./effects/DestroyConsumableEffect";
import { generateRedeemVoucherReturn } from "./effects/RedeemVoucherEffect";
import { generateEmitFlagReturn } from "./effects/EmitFlagEffect";

export interface EffectReturn {
  statement: string;
  message?: string;
  colour: string;
  configVariables?: string[];
  customCanUse?: string;
}

export interface ReturnStatementResult {
  statement: string;
  colour: string;
  preReturnCode?: string;
  isRandomChance?: boolean;
  configVariables?: string[];
  customCanUse?: string;
}

export function generateEffectReturnStatement(
  regularEffects: Effect[] = [],
  randomGroups: RandomGroup[] = [],
  modprefix: string,
  consumableKey?: string
): ReturnStatementResult {
  if (regularEffects.length === 0 && randomGroups.length === 0) {
    return {
      statement: "",
      colour: "G.C.WHITE",
      configVariables: [],
    };
  }

  let combinedPreReturnCode = "";
  let mainReturnStatement = "";
  let primaryColour = "G.C.WHITE";
  const customCanUseConditions: string[] = [];
  const allConfigVariables: string[] = [];
  const configVariableSet = new Set<string>();

  if (regularEffects.length > 0) {
    const effectReturns: EffectReturn[] = regularEffects
      .map((effect) => generateSingleEffect(effect, modprefix))
      .filter((ret) => ret.statement || ret.message);

    effectReturns.forEach((effectReturn) => {
      if (effectReturn.configVariables) {
        effectReturn.configVariables.forEach((configVar) => {
          if (!configVariableSet.has(configVar)) {
            configVariableSet.add(configVar);
            allConfigVariables.push(configVar);
          }
        });
      }
      if (effectReturn.customCanUse) {
        customCanUseConditions.push(effectReturn.customCanUse);
      }
    });

    const processedEffects: EffectReturn[] = [];
    effectReturns.forEach((effect) => {
      const { cleanedStatement, preReturnCode } = extractPreReturnCode(
        effect.statement
      );

      if (preReturnCode) {
        combinedPreReturnCode +=
          (combinedPreReturnCode ? "\n            " : "") + preReturnCode;
      }

      processedEffects.push({
        ...effect,
        statement: cleanedStatement,
      });
    });

    if (processedEffects.length > 0) {
      mainReturnStatement = buildConsumableEffectCode(processedEffects);
      primaryColour = processedEffects[0]?.colour ?? "G.C.WHITE";
    }
  }

  if (randomGroups.length > 0) {
    const denominators = [
      ...new Set(randomGroups.map((group) => group.chance_denominator as number)),
    ];
    const denominatorToOddsVar: Record<number, string> = {};

    if (denominators.length === 1) {
      denominatorToOddsVar[denominators[0]] = "card.ability.extra.odds";
      const oddsVar = "odds = " + denominators[0];
      if (!configVariableSet.has(oddsVar)) {
        configVariableSet.add(oddsVar);
        allConfigVariables.push(oddsVar);
      }
    } else {
      denominators.forEach((denom, index) => {
        if (index === 0) {
          denominatorToOddsVar[denom] = "card.ability.extra.odds";
          const oddsVar = "odds = " + denom;
          if (!configVariableSet.has(oddsVar)) {
            configVariableSet.add(oddsVar);
            allConfigVariables.push(oddsVar);
          }
        } else {
          denominatorToOddsVar[denom] = `card.ability.extra.odds${index + 1}`;
          const oddsVar = `odds${index + 1} = ${denom}`;
          if (!configVariableSet.has(oddsVar)) {
            configVariableSet.add(oddsVar);
            allConfigVariables.push(oddsVar);
          }
        }
      });
    }

    randomGroups.forEach((group, groupIndex) => {
      const effectReturns: EffectReturn[] = group.effects
        .map((effect) => generateSingleEffect(effect, modprefix))
        .filter((ret) => ret.statement || ret.message);

      effectReturns.forEach((effectReturn) => {
        if (effectReturn.configVariables) {
          effectReturn.configVariables.forEach((configVar) => {
            if (!configVariableSet.has(configVar)) {
              configVariableSet.add(configVar);
              allConfigVariables.push(configVar);
            }
          });
        }
        if (effectReturn.customCanUse) {
          customCanUseConditions.push(effectReturn.customCanUse);
        }
      });

      if (effectReturns.length === 0) return;

      const oddsVar = denominatorToOddsVar[group.chance_denominator as number];
      const probabilityIdentifier = `group_${groupIndex}_${group.id.substring(
        0,
        8
      )}`;

      let groupContent = "";
      let groupPreReturnCode = "";

      effectReturns.forEach((effect) => {
        if (effect.statement && effect.statement.trim()) {
          const { cleanedStatement, preReturnCode } = extractPreReturnCode(
            effect.statement
          );

          if (preReturnCode) {
            groupPreReturnCode +=
              (groupPreReturnCode ? "\n                " : "") + preReturnCode;
          }

          if (cleanedStatement.trim()) {
            groupContent += `
                ${cleanedStatement}`;
          }
        }
      });

      let fullGroupContent = groupContent;
      if (groupPreReturnCode) {
        fullGroupContent = `
                ${groupPreReturnCode}${groupContent}`;
      }

      const probabilityStatement = `SMODS.pseudorandom_probability(card, '${probabilityIdentifier}', ${group.chance_numerator}, ${oddsVar}, '${group.custom_key || `c_${modprefix}_${consumableKey}`}', ${group.respect_probability_effects === false})`
      
      const groupStatement = `if ${probabilityStatement} then
                ${fullGroupContent}
            end`;

      combinedPreReturnCode +=
        (combinedPreReturnCode ? "\n            " : "") + groupStatement;
    });
  }

  return {
    statement: mainReturnStatement,
    colour: primaryColour,
    preReturnCode: combinedPreReturnCode || undefined,
    isRandomChance: randomGroups.length > 0,
    configVariables: allConfigVariables,
    customCanUse:
      customCanUseConditions.length > 0
        ? customCanUseConditions.join(" and ")
        : undefined,
  };
}

const generateSingleEffect = (
  effect: Effect,
  modprefix: string
): EffectReturn => {
  switch (effect.type) {
    case "edit_cards":
      return generateEditCardsReturn(effect);

    case "double_dollars":
      return generateDoubleDollarsReturn(effect);

    case "edit_dollars":
      return generateEditDollarsReturn(effect);

    case "add_dollars_from_jokers":
      return generateAddDollarsFromJokersReturn(effect);

    case "create_consumable":
      return generateCreateConsumableReturn(effect);

    case "level_up_hand":
      return generateLevelUpHandReturn(effect);

    case "destroy_selected_cards":
      return generateDestroySelectedCardsReturn(effect);

    case "destroy_random_cards":
      return generateDestroyRandomCardsReturn(effect);

    case "edit_hand_size":
      return generateEditHandSizeReturn(effect);

    case "draw_cards":
      return generateDrawCardsReturn(effect);

    case "edit_hands":
      return generateEditHandsReturn(effect);

    case "edit_discards":
      return generateEditDiscardsReturn(effect);

    case "convert_all_cards_to_suit":
      return generateConvertAllCardsToSuitReturn(effect);

    case "convert_all_cards_to_rank":
      return generateConvertAllCardsToRankReturn(effect);

    case "edit_cards_in_hand":
      return generateEditCardsInHandReturn(effect);

    case "create_joker":
      return generateCreateJokerReturn(effect, modprefix);

    case "increment_rank":
      return generateIncrementRankReturn(effect);

    case "add_cards_to_hand":
      return generateAddCardsToHandReturn(effect);

    case "copy_random_joker":
      return generateCopyRandomJokerReturn(effect);

    case "destroy_random_joker":
      return generateDestroyRandomJokerReturn(effect);

    case "edition_random_joker":
      return generateEditionRandomJokerReturn(effect);

    case "copy_selected_cards":
      return generateCopySelectedCardsReturn(effect);

    case "convert_left_to_right":
      return generateConvertLeftToRightReturn(effect);

    case "fool_effect":
      return generateFoolEffectReturn(effect);

    case "edit_play_size":
      return generateEditPlaySizeReturn(effect);

    case "edit_discard_size":
      return generateEditDiscardSizeReturn(effect);

    case "edit_booster_slots":
      return generateEditBoosterSlotsReturn(effect);

    case "edit_voucher_slots":
      return generateEditVoucherSlotsReturn(effect);

    case "create_tag":
      return generateCreateTagReturn(effect);

    case "perma_bonus":
      return generatePermaBonusReturn(effect);

    case "edit_joker_slots":
      return generateEditJokerSlotsReturn(effect);

    case "destroy_consumable":
      return generateDestroyConsumableReturn(effect);

    case "redeem_voucher":
      return generateRedeemVoucherReturn(effect);
    
    case "emit_flag":
      return generateEmitFlagReturn(effect, modprefix);

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
};

const buildConsumableEffectCode = (effects: EffectReturn[]): string => {
  if (effects.length === 0) return "";

  let effectCode = "";
  effects.forEach((effect) => {
    if (effect.statement.trim()) {
      effectCode += `
            ${effect.statement}`;
    }
  });

  return effectCode.trim();
};

function extractPreReturnCode(statement: string): {
  cleanedStatement: string;
  preReturnCode?: string;
} {
  const preReturnStart = "__PRE_RETURN_CODE__";
  const preReturnEnd = "__PRE_RETURN_CODE_END__";

  if (statement.includes(preReturnStart) && statement.includes(preReturnEnd)) {
    const startIndex =
      statement.indexOf(preReturnStart) + preReturnStart.length;
    const endIndex = statement.indexOf(preReturnEnd);

    if (startIndex < endIndex) {
      const preReturnCode = statement.substring(startIndex, endIndex).trim();
      const cleanedStatement = statement
        .replace(
          new RegExp(`${preReturnStart}[\\s\\S]*?${preReturnEnd}`, "g"),
          ""
        )
        .trim();

      return { cleanedStatement, preReturnCode };
    }
  }

  return { cleanedStatement: statement };
}
