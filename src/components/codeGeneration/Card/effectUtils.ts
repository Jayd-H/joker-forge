import type { Effect, LoopGroup, RandomGroup } from "../../ruleBuilder/types";
import { generateAddMultReturn } from "./effects/AddMultEffect";
import { generateAddChipsReturn } from "./effects/AddChipsEffect";
import { generateEditDollarsReturn } from "./effects/EditDollarsEffect";
import { generateAddXChipsReturn } from "./effects/AddXChipsEffect";
import { generateAddXMultReturn } from "./effects/AddXMultEffect";
import { generateDestroyCardReturn } from "./effects/DestroyCardEffect";
import { generateRetriggerReturn } from "./effects/RetriggerEffect";
import { generateCreateJokerReturn } from "./effects/CreateJokerEffect";
import { generateDestroyJokerReturn } from "./effects/DestroyJokerEffect";
import { generateCopyJokerReturn } from "./effects/CopyJokerEffect";
import { generateLevelUpHandReturn } from "./effects/LevelUpHandEffect";
import { generateCreateConsumableReturn } from "./effects/CreateConsumableEffect";
import { generateCopyConsumableReturn } from "./effects/CopyConsumableEffect";
import { generateDestroyConsumableReturn } from "./effects/DestroyConsumableEffect";
import { generateShowMessageReturn } from "./effects/ShowMessageEffect";
import { generateBalanceReturn } from "./effects/BalanceEffect";
import { generateDrawCardsReturn } from "./effects/DrawCardsEffect";
import { generateCreateLastPlayedPlanetReturn } from "./effects/CreateLastPlayedPlanetEffect";
import { generateSwapChipsMultReturn } from "./effects/SwapChipsMultEffect";
import { generateModifyInternalVariableReturn } from "./effects/ModifyInternalVariableEffect";
import { generateEmitFlagReturn } from "./effects/EmitFlagEffect";
import { generateEditPlayingCardReturn } from "./effects/EditPlayingCardEffect";
import { getModPrefix } from "../../data/BalatroUtils";
import { generatePlaySoundReturn } from "./effects/PlaySoundEffect";
import { generateAddExpChipsReturn } from "./effects/AddExpChipsEffect";
import { generateAddExpMultReturn } from "./effects/AddExpMultEffect";
import { generateAddHyperChipsReturn } from "./effects/AddHyperChipsEffect";
import { generateAddHyperMultReturn } from "./effects/AddHyperMultEffect";
import { generateChangeRankVariableReturn } from "./effects/ChangeRankVariableEffect";
import { generateChangeSuitVariableReturn } from "./effects/ChangeSuitVariableEffect";
import { generateChangePokerHandVariableReturn } from "./effects/ChangePokerHandVariableEffect";
import { generateCrashGameReturn } from "./effects/CrashGameEffect";

export interface ConfigExtraVariable {
  name: string;
  value: number;
}

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

const generateSingleEffect = (
  effect: Effect,
  trigger?: string,
  itemType: "enhancement" | "seal" | "edition" = "enhancement"
): EffectReturn => {
  switch (effect.type) {
    case "add_mult":
      return generateAddMultReturn(effect, 0, itemType);

    case "add_chips":
      return generateAddChipsReturn(effect, 0, itemType);

    case "add_x_chips":
      return generateAddXChipsReturn(effect, 0, itemType);

    case "add_x_mult":
      return generateAddXMultReturn(effect, 0, itemType);

    case "add_exp_chips":
      return generateAddExpChipsReturn(effect, 0, itemType);

    case "add_exp_mult":
      return generateAddExpMultReturn(effect, 0, itemType);

    case "add_hyper_chips":
      return generateAddHyperChipsReturn(effect, 0, itemType);

    case "add_hyper_mult":
      return generateAddHyperMultReturn(effect, 0, itemType);

    case "edit_dollars":
      return generateEditDollarsReturn(effect, 0, itemType);

    case "destroy_card":
      return generateDestroyCardReturn(effect, trigger);

    case "retrigger_card":
      return generateRetriggerReturn(effect, 0, itemType);

    case "create_joker":
      return generateCreateJokerReturn(effect);

    case "destroy_joker":
      return generateDestroyJokerReturn(effect);

    case "copy_joker":
      return generateCopyJokerReturn(effect);

    case "level_up_hand":
      return generateLevelUpHandReturn(effect, 0, itemType);

    case "create_consumable":
      return generateCreateConsumableReturn(effect);

    case "copy_consumable":
      return generateCopyConsumableReturn(effect, trigger || "");

    case "destroy_consumable":
      return generateDestroyConsumableReturn(effect, trigger || "");

    case "show_message":
      return generateShowMessageReturn(effect);

    case "balance":
      return generateBalanceReturn(effect);

    case "draw_cards":
      return generateDrawCardsReturn(effect, 0, itemType);

    case "create_last_played_planet":
      return generateCreateLastPlayedPlanetReturn(effect);

    case "swap_chips_mult":
      return generateSwapChipsMultReturn(effect);

    case "modify_internal_variable":
      return generateModifyInternalVariableReturn(
        effect,
        trigger || "",
        itemType
      );
    
    case "change_rank_variable":
      return generateChangeRankVariableReturn(effect);

    case "change_suit_variable":
      return generateChangeSuitVariableReturn(effect);
    
      case "change_poker_hand_variable":
      return generateChangePokerHandVariableReturn(effect);

    case "emit_flag":
      return generateEmitFlagReturn(effect, getModPrefix());
    
    case "play_sound":
      return generatePlaySoundReturn(effect, getModPrefix());

    case "edit_playing_card":
      return generateEditPlayingCardReturn(effect, trigger);

    case "crash_game":
      return generateCrashGameReturn(effect);

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
};

export function generateEffectReturnStatement(
  regularEffects: Effect[] = [],
  randomGroups: RandomGroup[] = [],
  loopGroups: LoopGroup[] = [],
  modprefix: string,
  cardKey: string,
  trigger?: string,
  itemType: "enhancement" | "seal" | "edition" = "enhancement"
): ReturnStatementResult {
  if (regularEffects.length === 0 && randomGroups.length === 0 && loopGroups.length === 0) {
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
      .map((effect) => generateSingleEffect(effect, trigger, itemType))
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

    const effectCalls: string[] = [];

    effectReturns.forEach((effect) => {
      const { cleanedStatement, preReturnCode } = extractPreReturnCode(
        effect.statement
      );

      if (preReturnCode) {
        combinedPreReturnCode +=
          (combinedPreReturnCode ? "\n            " : "") + preReturnCode;
      }

      if (cleanedStatement && cleanedStatement.trim()) {
        const effectObj = `{${cleanedStatement.trim()}}`;
        effectCalls.push(`SMODS.calculate_effect(${effectObj}, card)`);
      }

      if (effect.message) {
        effectCalls.push(
          `card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${
            effect.message
          }, colour = ${effect.colour || "G.C.WHITE"}})`
        );
      }
    });

    if (combinedPreReturnCode && effectCalls.length > 0) {
      const isDiscardTrigger = trigger === "card_discarded";

      if (isDiscardTrigger) {
        const allCleanedStatements = effectReturns
          .map((effect) => {
            const { cleanedStatement } = extractPreReturnCode(effect.statement);
            return cleanedStatement && cleanedStatement.trim()
              ? cleanedStatement.trim()
              : null;
          })
          .filter(Boolean);

        if (allCleanedStatements.length === effectReturns.length) {
          mainReturnStatement = buildEnhancementEffectCode(
            effectReturns.map((effect) => ({
              ...effect,
              statement: extractPreReturnCode(effect.statement)
                .cleanedStatement,
            }))
          );
        } else {
          combinedPreReturnCode +=
            "\n            " + effectCalls.join("\n            ");
          mainReturnStatement = "";
        }
      } else {
        combinedPreReturnCode +=
          "\n            " + effectCalls.join("\n            ");
        mainReturnStatement = "";
      }
    } else if (effectCalls.length > 0) {
      const pureStatementEffects = effectReturns.filter((effect) => {
        const { cleanedStatement } = extractPreReturnCode(effect.statement);
        return (
          cleanedStatement &&
          cleanedStatement.trim() &&
          !extractPreReturnCode(effect.statement).preReturnCode
        );
      });

      if (pureStatementEffects.length === effectReturns.length) {
        mainReturnStatement = buildEnhancementEffectCode(
          pureStatementEffects.map((effect) => ({
            ...effect,
            statement: extractPreReturnCode(effect.statement).cleanedStatement,
          }))
        );
      } else {
        combinedPreReturnCode = effectCalls.join("\n            ");
        mainReturnStatement = "";
      }
    }

    if (effectReturns.length > 0) {
      primaryColour = effectReturns[0]?.colour ?? "G.C.WHITE";
    }
  }

  if (randomGroups.length > 0) {
    const denominators = [
      ...new Set(
        randomGroups.map((group) => group.chance_denominator as number)
      ),
    ];
    const denominatorToOddsVar: Record<number, string> = {};
    const abilityPath =
      itemType === "seal" ? "card.ability.seal.extra" : "card.ability.extra";

    if (denominators.length === 1) {
      denominatorToOddsVar[denominators[0]] = `${abilityPath}.odds`;
      const oddsVar = "odds = " + denominators[0];
      if (!configVariableSet.has(oddsVar)) {
        configVariableSet.add(oddsVar);
        allConfigVariables.push(oddsVar);
      }
    } else {
      denominators.forEach((denom, index) => {
        if (index === 0) {
          denominatorToOddsVar[denom] = `${abilityPath}.odds`;
          const oddsVar = "odds = " + denom;
          if (!configVariableSet.has(oddsVar)) {
            configVariableSet.add(oddsVar);
            allConfigVariables.push(oddsVar);
          }
        } else {
          denominatorToOddsVar[denom] = `${abilityPath}.odds${index + 1}`;
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
        .map((effect) => generateSingleEffect(effect, trigger, itemType))
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
      const groupEffectCalls: string[] = [];

      effectReturns.forEach((effect) => {
        const { cleanedStatement, preReturnCode } = extractPreReturnCode(
          effect.statement
        );

        if (preReturnCode) {
          groupPreReturnCode +=
            (groupPreReturnCode ? "\n                " : "") + preReturnCode;
        }

        if (cleanedStatement && cleanedStatement.trim()) {
          const effectObj = `{${cleanedStatement.trim()}}`;
          groupEffectCalls.push(`SMODS.calculate_effect(${effectObj}, card)`);
        }

        if (effect.message) {
          groupEffectCalls.push(
            `card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${
              effect.message
            }, colour = ${effect.colour || "G.C.WHITE"}})`
          );
        }
      });

      if (groupPreReturnCode) {
        groupContent += groupPreReturnCode;
        if (groupEffectCalls.length > 0) {
          groupContent +=
            "\n                " + groupEffectCalls.join("\n                ");
        }
      } else if (groupEffectCalls.length > 0) {
        groupContent = groupEffectCalls.join("\n                ");
      }

      const probabilityStatement =
        group.respect_probability_effects !== false
          ? `SMODS.pseudorandom_probability(card, '${probabilityIdentifier}', ${
              group.chance_numerator
            }, ${oddsVar}, '${
              group.custom_key || `m_${modprefix}_${cardKey}`
            }')`
          : `pseudorandom('${probabilityIdentifier}') < ${group.chance_numerator} / ${oddsVar}`;

      const groupStatement = `if ${probabilityStatement} then
                ${groupContent}
            end`;

      combinedPreReturnCode +=
        (combinedPreReturnCode ? "\n            " : "") + groupStatement;
    });
  }
  
  if (loopGroups.length > 0) {
    const repetitions = [
      ...new Set(loopGroups.map((group) => group.repetitions as number)),
    ];
    const repetitionsToVar: Record<number, string> = {};
    const abilityPath =
      itemType === "seal" ? "card.ability.seal.extra" : "card.ability.extra";

    if (repetitions.length === 1) {
      repetitionsToVar[repetitions[0]] = `${abilityPath}.repetitions`;
      const repetitionsVar = "repetitions = " + repetitions[0];
      if (!(typeof repetitions[0] === "string") && !configVariableSet.has(repetitionsVar)) {
        configVariableSet.add(repetitionsVar);
        allConfigVariables.push(repetitionsVar);
      }
    } else {
      repetitions.forEach((denom, index) => {
        if (index === 0) {
          repetitionsToVar[denom] = `${abilityPath}.repetitions`;
          const repetitionsVar = "repetitions = " + denom;
          if (!(typeof denom === "string") && !configVariableSet.has(repetitionsVar)) {
            configVariableSet.add(repetitionsVar);
            allConfigVariables.push(repetitionsVar);
          }
        } else {
          repetitionsToVar[denom] = `${abilityPath}.repetitions${index + 1}`;
          const repetitionsVar = `repetitions${index + 1} = ${denom}`;
          if (!(typeof denom === "string") && !configVariableSet.has(repetitionsVar)) {
            configVariableSet.add(repetitionsVar);
            allConfigVariables.push(repetitionsVar);
          }
        }
      });
    }

    loopGroups.forEach((group) => {
      const effectReturns: EffectReturn[] = group.effects
        .map((effect) => generateSingleEffect(effect, trigger, itemType))
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

      const repetitionsVar = typeof group.repetitions === "string" ? group.repetitions : repetitionsToVar[group.repetitions as number];

      let groupContent = "";
      let groupPreReturnCode = "";
      const groupEffectCalls: string[] = [];

      effectReturns.forEach((effect) => {
        const { cleanedStatement, preReturnCode } = extractPreReturnCode(
          effect.statement
        );

        if (preReturnCode) {
          groupPreReturnCode +=
            (groupPreReturnCode ? "\n                " : "") + preReturnCode;
        }

        if (cleanedStatement && cleanedStatement.trim()) {
          const effectObj = `{${cleanedStatement.trim()}}`;
          groupEffectCalls.push(`SMODS.calculate_effect(${effectObj}, card)`);
        }

        if (effect.message) {
          groupEffectCalls.push(
            `card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${
              effect.message
            }, colour = ${effect.colour || "G.C.WHITE"}})`
          );
        }
      });

      if (groupPreReturnCode) {
        groupContent += groupPreReturnCode;
        if (groupEffectCalls.length > 0) {
          groupContent +=
            "\n                " + groupEffectCalls.join("\n                ");
        }
      } else if (groupEffectCalls.length > 0) {
        groupContent = groupEffectCalls.join("\n                ");
      }

      const loopStatement =  `for i = 1, ${repetitionsVar} do`;
      
      const groupStatement = `${loopStatement}
              ${groupContent}
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

const buildEnhancementEffectCode = (effects: EffectReturn[]): string => {
  if (effects.length === 0) return "";

  const returnParts: string[] = [];

  effects.forEach((effect) => {
    if (effect.statement.trim()) {
      returnParts.push(effect.statement.trim());
    }
  });

  if (returnParts.length === 0) return "";

  if (returnParts.length === 1) {
    return `{ ${returnParts[0]} }`;
  }

  return `{ ${returnParts.join(", ")} }`;
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
