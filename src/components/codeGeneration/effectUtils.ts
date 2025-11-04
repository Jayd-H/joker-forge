import type { Effect, LoopGroup, RandomGroup } from "../ruleBuilder/types";
import { JokerData, EnhancementData, SealData, EditionData, ConsumableData, VoucherData, DeckData } from "../data/BalatroUtils";
import { generateAddChipsEffectCode } from "./Effects/ScoringEffects/AddChipsEffect";
import { generateApplyXChipsEffectCode } from "./Effects/ScoringEffects/ApplyXChipsEffect";
import { generateApplyExpChipsEffectCode } from "./Effects/ScoringEffects/ApplyExpChipsEffect";
import { generateApplyHyperChipsEffectCode } from "./Effects/ScoringEffects/ApplyHyperChipsEffect";
import { generateAddMultEffectCode } from "./Effects/ScoringEffects/AddMultEffect";
import { generateApplyXMultEffectCode } from "./Effects/ScoringEffects/ApplyXMultEffect";
import { generateApplyExpMultEffectCode } from "./Effects/ScoringEffects/ApplyExpMultEffect";
import { generateApplyHyperMultEffectCode } from "./Effects/ScoringEffects/ApplyHyperMultEffect";
import { generateDrawCardsEffectCode } from "./Effects/DrawCardsEffect";
import { generateBalanceChipsAndMultEffectCode } from "./Effects/ScoringEffects/BalanceChipsAndMultEffect";
import { generateSwapChipsAndMultEffectCode } from "./Effects/ScoringEffects/SwapChipsAndMultEffect";
import { generateShowMessageEffectCode } from "./Effects/ShowMessageEffect";
import { generateDisableBossBlindEffectCode, generateDisableBossBlindPassiveEffectCode } from "./Effects/DisableBossBlindEffect";
import { generateEmitFlagEffectCode } from "./Effects/EmitFlagEffect";
import { generatePlaySoundEffectCode } from "./Effects/PlaySoundEffect";
import { generateWinBlindEffectCode } from "./Effects/WinBlindEffect";
import { generateEditCardAppearanceEffectCode } from "./Effects/EditCardAppearanceEffect";
import { generateChangeKeyVariableEffectCode } from "./Effects/Variables/ChangeKeyVariableEffect";
import { generateChangePokerHandVariableEffectCode } from "./Effects/Variables/ChangePokerHandVariableEffect";
import { generateChangeSuitVariableEffectCode } from "./Effects/Variables/ChangeSuitVariableEffect";
import { generateChangeRankVariableEffectCode } from "./Effects/Variables/ChangeRankVariableEffect";
import { generateConvertAllCardToRankEffectCode } from "./Effects/ConvertAllCardsToRankEffect";
import { generateConvertAllCardsToSuitEffectCode } from "./Effects/ConvertAllCardsToSuitEffect";
import { generateConvertLeftToRightEffectCode } from "./Effects/ConvertLeftToRightEffect";
import { generateCopyConsumableEffectCode } from "./Effects/CopyConsumableEffect";
import { generateCopyJokerEffectCode } from "./Effects/CopyJokerEffect";
import { generateCrashGameEffectCode } from "./Effects/CrashGameEffect";
import { generateCreateConsumableEffectCode } from "./Effects/CreateConsumableEffect";
import { generateCreateJokerEffectCode } from "./Effects/CreateJokerEffect";
import { generateCreateLastPlayedPlanetEffectCode } from "./Effects/CreateLastPlayedPlanetEffect";
import { generateCreateTagEffectCode } from "./Effects/CreateTagEffect";
import { generateUnlockJokerEffectCode } from "./Effects/UnlockJokerEffect";
import { generateShuffleJokersEffectCode } from "./Effects/ShuffleJokersEffect";
import { generateSetSellValueEffectCode } from "./Effects/SetSellValueEffect";
import { generateSetDollarsEffectCode } from "./Effects/SetDollarsEffect";
import { generateSetAnteEffectCode } from "./Effects/SetAnteEffect";
import { generateSavedEffectCode } from "./Effects/SavedEffect";
import { generateRetriggerEffectCode } from "./Effects/RetriggerEffect";
import { generateRedeemVoucherEffectCode } from "./Effects/RedeemVoucherEffect";
import { generatePermaBonusEffectCode } from "./Effects/PermanentBonusEffect";
import { generateModProbabilityEffectCode } from "./Effects/ModProbabilityEffect";
import { generateFixProbabilityEffectCode } from "./Effects/FixProbabilityEffect";
import { generateFlipJokerEffectCode } from "./Effects/FlipJokerEffect";
import { generateForceGameOverEffectCode } from "./Effects/ForceGameOverEffect";
import { generateJuiceUpEffectCode } from "./Effects/JuiceUpEffect";
import { generateLevelUpHandEffectCode } from "./Effects/LevelUpHandEffect";
import { generateModifyBlindRequirementEffectCode } from "./Effects/ModifyBlindRequirementEffect";
import { generateModifyInternalVariableEffectCode } from "./Effects/Variables/ModifyInternalVariableEffect";
import { generateFoolEffectCode } from "./Effects/FoolEffect";
import { generateIncrementRankEffectCode } from "./Effects/IncrementRankEffect";
import { generateDestroyCardsEffectCode } from "./Effects/DestroyCardsEffect";
import { generateDestroyJokerEffectCode } from "./Effects/DestroyJokerEffect";
import { generateDestroyConsumableEffectCode } from "./Effects/DestroyConsumableEffect";
import { generateEditStartingCardsEffectCode } from "./Effects/EditStartingDeckEffects/EditStartingCardsEffect";
import { generateEditStartingSuitsEffectCode } from "./Effects/EditStartingDeckEffects/EditStartingSuitsEffect";
import { generateEditStartingRanksEffectCode } from "./Effects/EditStartingDeckEffects/EditStartingRanksEffect";
import { generateEditJokerEffectCode } from "./Effects/EditJokerEffect";
import { generateEditWinnerAnteEffectCode } from "./Effects/EditWinnerAnteEffect";
import { generateAddStartingCardsEffectCode } from "./Effects/EditStartingDeckEffects/AddStartingCardsEffect";
import { generateRemoveStartingCardsEffectCode } from "./Effects/EditStartingDeckEffects/RemoveStartingCardsEffect";
import { generateDestroyCardEffectCode } from "./Effects/DestroyCardEffect";
import { generateEditCardEffectCode } from "./Effects/EditCardEffect";
import { generateEditCardsEffectCode } from "./Effects/EditCardsEffect";
import { generateAllowDebtPassiveEffectCode } from "./Effects/AllowDebtEffect";
import { generateCopyJokerAbilityPassiveEffectCode } from "./Effects/PassiveEffects/CopyJokerAbilityEffect";
import { generateEditDiscardsEffectCode, generateEditDiscardsPassiveEffectCode } from "./Effects/EditDiscardsEffect";
import { generateEditHandsEffectCode, generateEditHandsPassiveEffectCode } from "./Effects/EditHandsEffect";
import { generateSplashPassiveEffectCode } from "./Effects/PassiveEffects/SplashEffect";
import { generateFreeRerollsEffectCode, generateFreeRerollsPassiveEffectCode } from "./Effects/FreeRerollsEffect";
import { generateEditConsumableSlotsEffectCode, generateEditConsumableSlotsPassiveEffectCode } from "./Effects/EditConsumableSlotsEffect";
import { generateEditJokerSlotsEffectCode, generateEditJokerSlotsPassiveEffectCode } from "./Effects/EditJokerSlotsEffect";
import { generateDiscountItemsEffectCode, generateDiscountItemsPassiveEffectCode } from "./Effects/DiscountItemsEffect";
import { generateReduceFlushStraightRequirementsPassiveEffectCode } from "./Effects/PassiveEffects/ReduceFlushStraightRequirementEffect";
import { generateShortcutPassiveEffectCode } from "./Effects/PassiveEffects/ShortcutEffect";
import { generateShowmanPassiveEffectCode } from "./Effects/PassiveEffects/ShowmanEffect";
import { generateCombineRanksPassiveEffectCode } from "./Effects/PassiveEffects/CombineRanksEffect";
import { generateCombineSuitsPassiveEffectCode } from "./Effects/PassiveEffects/CombineSuitsEffect";
import { generateCreateCopyTriggeredCardEffectCode } from "./Effects/CreateCopyTriggeredCardEffect";
import { generateCreateCopyPlayedCardEffectCode } from "./Effects/CreateCopyPlayedCardEffect";
import { generateEditDiscardsMoneyEffectCode } from "./Effects/EditEndRoundDiscardMoneyEffect";
import { generateEditHandsMoneyEffectCode } from "./Effects/EditEndRoundHandMoneyEffect";
import { generateEditInterestCapEffectCode } from "./Effects/EditInterestCapEffect";
import { generateEditRerollPriceEffectCode } from "./Effects/EditRerollPriceEffect";
import { generateEditBoosterPacksEffectCode } from "./Effects/EditBoosterPacksEffect";
import { generateEditItemWeightEffectCode } from "./Effects/EditItemWeightEffect";
import { coordinateVariableConflicts } from "./Jokers/variableUtils";
import { generateEditStartingDollarsEffectCode } from "./Effects/EditStartingDeckEffects/EditStartingDollarsEffect";
import { generateEditItemSizeEffectCode, generateEditItemSizePassiveEffectCode } from "./Effects/EditItemSizeEffect";
import { generateChangeTextVariableEffectCode } from "./Effects/Variables/ChangeTextVariableEffect";
import { generateCreatePlayingCardEffectCode } from "./Effects/CreatePlayingCardEffect";

interface ExtendedEffect extends Effect {
  _isInRandomGroup?: boolean;
  _ruleContext?: string;
  _effectIndex?: number;
}

export interface PassiveEffectResult {
  addToDeck?: string;
  removeFromDeck?: string;
  configVariables?: string[];
  locVars?: string[];
  calculateFunction?: string;
  needsHook?: {
    hookType: string;
    jokerKey: string;
    effectParams: unknown;
  };
}

export interface ConfigExtraVariable {
  name: string;
  value: number | string;
  description?: string;
}

export interface EffectReturn {
  statement: string;
  message?: string;
  colour: string;
  configVariables?: ConfigExtraVariable[] ;
  effectType?: string;
  customCanUse?: string;
}

export interface ReturnStatementResult {
  statement: string;
  colour: string;
  preReturnCode?: string;
  isRandomChance?: boolean;
  configVariables?: ConfigExtraVariable[];
  customCanUse?: string;
}

export interface CalculateFunctionResult {
  code: string;
  configVariables: ConfigExtraVariable[];
}

export function generateEffectReturnStatement(
  regularEffects: Effect[] = [],
  randomGroups: RandomGroup[] = [],
  loopGroups: LoopGroup[] = [],
  itemType: string,
  triggerType: string = "hand_played",
  modprefix: string,
  ruleId?: string,
  globalEffectCounts?: Map<string, number>,
  joker?: JokerData,
  consumable?: ConsumableData,
  card?: EditionData | EnhancementData | SealData,
  voucher?: VoucherData,
  deck?: DeckData,
): ReturnStatementResult {
  if (regularEffects.length === 0 && randomGroups.length === 0 && loopGroups.length === 0) {
    return {
      statement: "",
      colour: "G.C.WHITE",
      configVariables: [],
    };
  }

  const object = 
    (itemType === "joker") ? joker :
    (itemType === "consumable") ? consumable :
    (itemType === "card") ? card :
    (itemType === "voucher") ? voucher :
    (itemType === "deck") ? deck : 
    null
    
  const allRandomGroups: RandomGroup[] = []
  const allLoopGroups: LoopGroup[] = []

  object?.rules?.forEach(rule => {
    const randoms = rule.randomGroups || []
    const loops = rule.loops || []
    allLoopGroups.push(...loops)
    allRandomGroups.push(...randoms)
  });

  let combinedPreReturnCode = "";
  let mainReturnStatement = "";
  let primaryColour = "G.C.WHITE";
  const allConfigVariables: ConfigExtraVariable[] = [];

  if (regularEffects.length > 0) {
    const { preReturnCode: regularPreCode, modifiedEffects } =
      coordinateVariableConflicts(regularEffects);

    const effectReturns: EffectReturn[] = modifiedEffects
      .map((effect) => {
        const effectWithContext: ExtendedEffect = {
          ...effect,
          _ruleContext: ruleId,
        };

        const currentCount = globalEffectCounts?.get(effect.type) || 0;
        if (globalEffectCounts) {
          globalEffectCounts.set(effect.type, currentCount + 1);
        }

        const result = generateSingleEffect(
          effectWithContext,
          itemType,
          triggerType,
          currentCount,
          modprefix,
          joker,
          card,
        );
        return {
          ...result,
          effectType: effect.type,
        };
      })
      .filter((ret) => ret.statement || ret.message);

    if (regularPreCode) {
      combinedPreReturnCode += regularPreCode;
    }

    effectReturns.forEach((effectReturn) => {
      if (effectReturn.configVariables) {
        allConfigVariables.push(...effectReturn.configVariables);
      }
    });

    const processedEffects: EffectReturn[] = [];
    effectReturns.forEach((effect) => {
      const { newStatement, preReturnCode } = extractPreReturnCode(
        effect.statement
      );

      if (preReturnCode) {
        combinedPreReturnCode +=
          (combinedPreReturnCode ? "\n                " : "") + preReturnCode;
      }

      processedEffects.push({
        ...effect,
        statement: newStatement,
      });
    });

    if (processedEffects.length > 0) {
      mainReturnStatement = buildReturnStatement(processedEffects);
      primaryColour = processedEffects[0]?.colour ?? "G.C.WHITE";
    }
  }

  if (randomGroups.length > 0) {
    const randomGroupStatements: string[] = [];
  
    const currentDenominators = [
      ...new Set(randomGroups.map((group) => group.chance_denominator as number)),
    ];
    const allDenominators = [
      ...new Set(allRandomGroups.map((group) => group.chance_denominator as number)),
    ];
    const denominatorToOddsVar: Record<number, string> = {};
    const abilityPath =
      itemType === "seal" ? "card.ability.seal.extra" : "card.ability.extra";

    allDenominators.forEach((denom, index) => {
      if (index === 0) {
        denominatorToOddsVar[denom] =`${abilityPath}.odds`;
      } else {
        denominatorToOddsVar[denom] = `${abilityPath}.odds${index + 1}`;
      }
    })

    if (currentDenominators.length === 1) {
      allConfigVariables.push({
        name: "odds",
        value: currentDenominators[0],
        description: "Probability denominator",
      });
    } else {
      currentDenominators.forEach((denom, index) => {
        if (index === 0) {
          allConfigVariables.push({
            name: "odds",
            value: denom,
            description: "First probability denominator",
          });
        } else {
          allConfigVariables.push({
            name: `odds${index + 1}`,
            value: denom,
            description: `${index + 1}${getOrdinalSuffix(
              index + 1
            )} probability denominator`,
          });
        }
      });
    }

    randomGroups.forEach((group, groupIndex) => {
      const { preReturnCode: groupPreCode, modifiedEffects } =
        coordinateVariableConflicts(group.effects);

      const effectReturns: EffectReturn[] = modifiedEffects
        .map((effect) => {
          const effectWithContext: ExtendedEffect = {
            ...effect,
            _ruleContext: ruleId,
            _isInRandomGroup: true,
          };

          const currentCount = globalEffectCounts?.get(effect.type) || 0;
          if (globalEffectCounts) {
            globalEffectCounts.set(effect.type, currentCount + 1);
          }

          const result = generateSingleEffect(
            effectWithContext,
            itemType,
            triggerType,
            currentCount,
            modprefix,
            joker,
            card,
          );
          return {
            ...result,
            effectType: effect.type,
          };
        })
        .filter((ret) => ret.statement || ret.message);

      effectReturns.forEach((effectReturn) => {
        if (effectReturn.configVariables) {
          allConfigVariables.push(...effectReturn.configVariables);
        }
      });

      if (effectReturns.length === 0) return;

      let groupPreReturnCode = groupPreCode || "";
      const processedEffects: EffectReturn[] = [];

      effectReturns.forEach((effect) => {
        const { newStatement, preReturnCode } = extractPreReturnCode(
          effect.statement
        );

        if (preReturnCode) {
          groupPreReturnCode +=
            (groupPreReturnCode ? "\n                        " : "") +
            preReturnCode;
        }

        processedEffects.push({
          ...effect,
          statement: newStatement,
        });
      });

      const oddsVar = denominatorToOddsVar[group.chance_denominator as number];
      const probabilityIdentifier = `group_${groupIndex}_${group.id.substring(
        0,
        8
      )}`;

      let groupContent = "";

      const hasDeleteInGroup = group.effects.some(
        (effect) => effect.type === "delete_triggered_card"
      );

      if (
        hasDeleteInGroup &&
        (triggerType === "card_scored" ||
          triggerType === "card_held_in_hand" ||
          triggerType === "card_held_in_hand_end_of_round")
      ) {
        groupContent += `context.other_card.should_destroy = true
                        `;
      }

      if (groupPreReturnCode && groupPreReturnCode.trim()) {
        groupContent += `${groupPreReturnCode}
                        `;
      }

      const isRetriggerEffect = (effect: EffectReturn): boolean => {
        return (
          effect.effectType === "retrigger_cards" ||
          (effect.statement
            ? effect.statement.includes("repetitions") ||
              effect.statement.includes("repetition")
            : false)
        );
      };

      const retriggerEffects = processedEffects.filter(isRetriggerEffect);
      const nonRetriggerEffects = processedEffects.filter(
        (effect) => !isRetriggerEffect(effect)
      );
      const hasFixProbablityEffects = processedEffects.some(
        (effect) => effect.effectType === "fix_probability"
      );
      const hasModProbablityEffects = processedEffects.some(
        (effect) => effect.effectType === "mod_probability"
      );

      const nonRetriggerEffectCalls: string[] = [];
      if (retriggerEffects.length > 0) {
        const retriggerStatements = retriggerEffects
          .filter((effect) => effect.statement && effect.statement.trim())
          .map((effect) => effect.statement);

        nonRetriggerEffects.forEach((effect) => {
          if (effect.message) {
            nonRetriggerEffectCalls.push(
              `card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${
                effect.message
              }, colour = ${effect.colour || "G.C.WHITE"}})`  
            );        
          }
        })

        if (nonRetriggerEffectCalls.length > 0) {
          groupContent += nonRetriggerEffectCalls.join("\n                        ");
        }

        if (retriggerStatements.length > 0) {
          const returnObj = `{${retriggerStatements.join(", ")}}`;
          groupContent += `
          return ${returnObj}`;
        }
      }

      const effectCalls: string[] = [];
      nonRetriggerEffects.forEach((effect) => {
        if (effect.statement && effect.statement.trim()) {
          const effectObj = `{${effect.statement}}`;
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
      
      if (effectCalls.filter(effect => !nonRetriggerEffectCalls.includes(effect)).length > 0) {
        groupContent += effectCalls.filter(effect => 
          !nonRetriggerEffectCalls.includes(effect)).join("\n                        ");
      }

      const no_modParam = (
        hasFixProbablityEffects || hasModProbablityEffects // prevents stack overflow
      ) || group.respect_probability_effects === false;
      
      const probabilityStatement =  `SMODS.pseudorandom_probability(card, '${probabilityIdentifier}', ${group.chance_numerator}, ${oddsVar}, '${group.custom_key || `j_${modprefix}_${object?.objectKey}`}', ${no_modParam})`;
      
      const groupStatement = `if ${probabilityStatement} then
              ${groupContent}
          end`;

      randomGroupStatements.push(groupStatement);
    });

    if (mainReturnStatement && randomGroupStatements.length > 0) {
      const randomGroupCode = randomGroupStatements.join(
        "\n                    "
      );
      const funcStatement = `func = function()
                        ${randomGroupCode}
                        return true
                    end`;

      if (
        mainReturnStatement.includes("return {") &&
        mainReturnStatement.includes("}")
      ) {
        const insertIndex = mainReturnStatement.lastIndexOf("}");
        mainReturnStatement =
          mainReturnStatement.slice(0, insertIndex) +
          `,
                    ${funcStatement}
                ${mainReturnStatement.slice(insertIndex)}`;
      }
    } else if (!mainReturnStatement && randomGroupStatements.length > 0) {
      mainReturnStatement = randomGroupStatements.join("\n                ");
      if (randomGroups.length > 0 && randomGroups[0].effects.length > 0) {
        const firstEffect = randomGroups[0].effects[0];
        const firstEffectResult = generateSingleEffect(
          firstEffect,
          itemType,
          triggerType,
          0,
          modprefix,
          joker,
          card
        );
        primaryColour = firstEffectResult.colour || "G.C.WHITE";
      }
    }
  }
  
  if (loopGroups.length > 0) {
    const loopGroupStatements: string[] = [];

    const allRepetitions = [
      ...new Set(allLoopGroups.map((group) => group.repetitions as number)),
    ];
    const currentRepetitions = [
      ...new Set(loopGroups.map((group) => group.repetitions as number)),
    ];

    const repetitionsToVar: Record<number, string> = {};
    const abilityPath =
      itemType === "seal" ? "card.ability.seal.extra" : "card.ability.extra";

    allRepetitions.forEach((value, index) => {
      if (index === 0) {
        repetitionsToVar[value] = `${abilityPath}.repetitions`;
      } else {
        repetitionsToVar[value] = `${abilityPath}.repetitions${index + 1}`;
      }
    })

    if (currentRepetitions.length === 1) {
      if (!(typeof currentRepetitions[0] === "string")) {
        allConfigVariables.push({
          name: "repetitions",
          value: currentRepetitions[0],
          description: "Loop repetitions",
        });
      }
    } else {
      currentRepetitions.forEach((value, index) => {
        if (index === 0) {
          if (!(typeof value === "string")) {
            allConfigVariables.push({
              name: "repetitions",
              value: value,
              description: "First loop repetitions",
            });
          }
        } else {
          if (!(typeof value === "string")) {
            allConfigVariables.push({
              name: `repetitions${index + 1}`,
              value: value,
              description: `${index + 1}${getOrdinalSuffix(
                index + 1
              )} loop repetitions`,
            });
          }
        }
      });
    }

    loopGroups.forEach((group) => {
      const { preReturnCode: groupPreCode, modifiedEffects } =
        coordinateVariableConflicts(group.effects);

      const effectReturns: EffectReturn[] = modifiedEffects
        .map((effect) => {
          const effectWithContext: ExtendedEffect = {
            ...effect,
            _ruleContext: ruleId,
            _isInRandomGroup: true,
          };

          const currentCount = globalEffectCounts?.get(effect.type) || 0;
          if (globalEffectCounts) {
            globalEffectCounts.set(effect.type, currentCount + 1);
          }

          const result = generateSingleEffect(
            effectWithContext,
            itemType,
            triggerType,
            currentCount,
            modprefix,
            joker,
            card,
          );
          return {
            ...result,
            effectType: effect.type,
          };
        })
        .filter((ret) => ret.statement || ret.message);

      effectReturns.forEach((effectReturn) => {
        if (effectReturn.configVariables) {
          allConfigVariables.push(...effectReturn.configVariables);
        }
      });

      if (effectReturns.length === 0) return;

      let groupPreReturnCode = groupPreCode || "";
      const processedEffects: EffectReturn[] = [];

      effectReturns.forEach((effect) => {
        const { newStatement, preReturnCode } = extractPreReturnCode(
          effect.statement
        );

        if (preReturnCode) {
          groupPreReturnCode +=
            (groupPreReturnCode ? "\n                        " : "") +
            preReturnCode;
        }

        processedEffects.push({
          ...effect,
          statement: newStatement,
        });
      });

      const repetitionsVar = typeof group.repetitions === "string" ? group.repetitions : repetitionsToVar[group.repetitions as number];

      let groupContent = "";

      const hasDeleteInGroup = group.effects.some(
        (effect) => effect.type === "delete_triggered_card"
      );

      if (
        hasDeleteInGroup &&
        (triggerType === "card_scored" ||
          triggerType === "card_held_in_hand" ||
          triggerType === "card_held_in_hand_end_of_round")
      ) {
        groupContent += `context.other_card.should_destroy = true
                        `;
      }

      if (groupPreReturnCode && groupPreReturnCode.trim()) {
        groupContent += `${groupPreReturnCode}
                        `;
      }

      const isRetriggerEffect = (effect: EffectReturn): boolean => {
        return (
          effect.effectType === "retrigger_cards" ||
          (effect.statement
            ? effect.statement.includes("repetitions") ||
              effect.statement.includes("repetition")
            : false)
        );
      };

      const retriggerEffects = processedEffects.filter(isRetriggerEffect);
      const nonRetriggerEffects = processedEffects.filter(
        (effect) => !isRetriggerEffect(effect)
      );

      if (retriggerEffects.length > 0) {
        const retriggerStatements = retriggerEffects
          .filter((effect) => effect.statement && effect.statement.trim())
          .map((effect) => effect.statement);

        if (retriggerStatements.length > 0) {
          const returnObj = `{${retriggerStatements.join(", ")}}`;
          groupContent += `return ${returnObj}
                        `;
        }
      }

      const effectCalls: string[] = [];
      nonRetriggerEffects.forEach((effect) => {
        if (effect.statement && effect.statement.trim()) {
          const effectObj = `{${effect.statement}}`;
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

      if (effectCalls.length > 0) {
        groupContent += effectCalls.join("\n                        ");
      }

      
      const loopStatement =  `for i = 1, ${repetitionsVar} do`;
      
      const groupStatement = `${loopStatement}
              ${groupContent}
          end`;

      loopGroupStatements.push(groupStatement);
    });

    if (mainReturnStatement && loopGroupStatements.length > 0) {
      const loopGroupCode = loopGroupStatements.join(
        "\n                    "
      );
      const funcStatement = `func = function()
                        ${loopGroupCode}
                        return true
                    end`;

      if (
        mainReturnStatement.includes("return {") &&
        mainReturnStatement.includes("}")
      ) {
        const insertIndex = mainReturnStatement.lastIndexOf("}");
        mainReturnStatement =
          mainReturnStatement.slice(0, insertIndex) +
          `,
                    ${funcStatement}
                ${mainReturnStatement.slice(insertIndex)}`;
      }
    } else if (!mainReturnStatement && loopGroupStatements.length > 0) {
      mainReturnStatement = loopGroupStatements.join("\n                ");
      if (loopGroups.length > 0 && loopGroups[0].effects.length > 0) {
        const firstEffect = loopGroups[0].effects[0];
        const firstEffectResult = generateSingleEffect(
          firstEffect,
          itemType,
          triggerType,
          0,
          modprefix,
          joker, 
        );
        primaryColour = firstEffectResult.colour || "G.C.WHITE";
      }
    }
  }
  return {
    statement: mainReturnStatement,
    colour: primaryColour,
    preReturnCode: combinedPreReturnCode || undefined,
    isRandomChance: randomGroups.length > 0,
    configVariables: allConfigVariables,
  };
};

export const generateSingleEffect = (
  effect: ExtendedEffect,
  cleanItemType: string,
  triggerType: string,
  sameTypeCount: number = 0,
  modprefix: string,
  joker?: JokerData,
  card?: EnhancementData | EditionData | SealData,
): EffectReturn => {
  const itemType = (cleanItemType === 'seal' || cleanItemType === 'edition' || cleanItemType ==='enhancement') 
    ? 'card' : cleanItemType

  switch (effect.type) {
    case "add_chips":
      return generateAddChipsEffectCode(effect, itemType, sameTypeCount)
    case "apply_x_chips":
      return generateApplyXChipsEffectCode(effect, itemType, sameTypeCount)
    case "apply_exp_chips":
      return generateApplyExpChipsEffectCode(effect, itemType, sameTypeCount)
    case "apply_hyper_chips":
      return generateApplyHyperChipsEffectCode(effect, itemType, sameTypeCount)
    case "add_mult":
      return generateAddMultEffectCode(effect, itemType, sameTypeCount)
    case "apply_x_mult":
      return generateApplyXMultEffectCode(effect, itemType, sameTypeCount)
    case "apply_exp_mult":
      return generateApplyExpMultEffectCode(effect, itemType, sameTypeCount)
    case "apply_hyper_mult":
      return generateApplyHyperMultEffectCode(effect, itemType, sameTypeCount)
    case "balance_chips_mult":
      return generateBalanceChipsAndMultEffectCode(effect)
    case "swap_chips_mult":
      return generateSwapChipsAndMultEffectCode(effect)
    case "change_key_variable":
      return generateChangeKeyVariableEffectCode(effect)
    case "change_pokerhand_variable":
      return generateChangePokerHandVariableEffectCode(effect)
    case "change_suit_variable":
      return generateChangeSuitVariableEffectCode(effect)
    case "change_rank_variable":
      return generateChangeRankVariableEffectCode(effect)
    case "change_text_variable":
      return generateChangeTextVariableEffectCode(effect)
    case "modify_internal_variable":
      return generateModifyInternalVariableEffectCode(effect, triggerType)
    case "convert_all_cards_to_rank":
      return generateConvertAllCardToRankEffectCode(effect, itemType)
    case "convert_all_cards_to_suit":
      return generateConvertAllCardsToSuitEffectCode(effect, itemType)
    case "convert_left_to_right":
      return generateConvertLeftToRightEffectCode(effect, itemType)
    case "create_playing_card":
      return generateCreatePlayingCardEffectCode(effect, itemType, triggerType, modprefix, joker)
    case "create_copy_triggered_card":
      return generateCreateCopyTriggeredCardEffectCode(effect, itemType, triggerType)
    case "create_copy_played_card":
      return generateCreateCopyPlayedCardEffectCode(effect, itemType, triggerType, joker)
    case "copy_consumable":
      return generateCopyConsumableEffectCode(effect, itemType, triggerType)
    case "copy_joker":
      return generateCopyJokerEffectCode(effect, itemType, triggerType)
    case "crash_game":
      return generateCrashGameEffectCode(effect)
    case "create_consumable":
      return generateCreateConsumableEffectCode(effect, itemType, triggerType)
    case "create_joker":
      return generateCreateJokerEffectCode(effect, itemType, triggerType)
    case "create_last_played_planet":
      return generateCreateLastPlayedPlanetEffectCode(effect, itemType)
    case "create_tag":
      return generateCreateTagEffectCode(effect, triggerType)
    case "destroy_cards":
      return generateDestroyCardsEffectCode(effect, itemType, sameTypeCount)
    case "destroy_playing_card":
      return generateDestroyCardEffectCode(effect, itemType, triggerType)
    case "destroy_joker":
      return generateDestroyJokerEffectCode(effect, itemType, triggerType, sameTypeCount)
    case "destroy_consumable":
      return generateDestroyConsumableEffectCode(effect, itemType, triggerType)
    case "draw_cards":
      return generateDrawCardsEffectCode(effect, itemType, sameTypeCount, card)
    case "disable_boss_blind":
      return generateDisableBossBlindEffectCode(effect, itemType, triggerType)
    case "discount_items":
      return generateDiscountItemsEffectCode(effect, itemType, sameTypeCount)
    case "free_rerolls":
      return generateFreeRerollsEffectCode(effect, itemType, sameTypeCount)
    case "edit_joker":
      return generateEditJokerEffectCode(effect, itemType, modprefix) // NEED TO IMPLEMENT METHODS PROPERLY
    case "edit_win_ante":
      return generateEditWinnerAnteEffectCode(effect, itemType, triggerType, sameTypeCount)
    case "edit_booster_packs":
      return generateEditBoosterPacksEffectCode(effect, itemType, sameTypeCount)
    case "edit_booster_slots": case "edit_voucher_slots": case "edit_shop_slots":
    case "edit_discard_size": case "edit_hand_size": case "edit_play_size":
      const sizeItemType = effect.type.slice(5)
      return generateEditItemSizeEffectCode(effect, cleanItemType, sameTypeCount, sizeItemType)
    case "edit_playing_card":
      return generateEditCardEffectCode(effect, itemType, triggerType, modprefix, joker)
    case "edit_cards":
      return generateEditCardsEffectCode(effect, itemType, modprefix)
    case "edit_joker_slots":
      return generateEditJokerSlotsEffectCode(effect, itemType, sameTypeCount)
    case "edit_consumable_slots":
      return generateEditConsumableSlotsEffectCode(effect, itemType, sameTypeCount)
    case "edit_discards_money":
      return generateEditDiscardsMoneyEffectCode(effect, itemType, sameTypeCount)
    case "edit_hands_money":
      return generateEditHandsMoneyEffectCode(effect, itemType, sameTypeCount)
    case "edit_interest_cap":
      return generateEditInterestCapEffectCode(effect, itemType, sameTypeCount)
    case "edit_reroll_price":
      return generateEditRerollPriceEffectCode(effect, itemType, sameTypeCount)
    case "edit_hands":
      return generateEditHandsEffectCode(effect, itemType, sameTypeCount)
    case "edit_discards":
      return generateEditDiscardsEffectCode(effect, itemType, sameTypeCount)
    case "edit_card_appearance":
      return generateEditCardAppearanceEffectCode(effect)
    case "edit_rarity_weight": case "edit_item_weight":
      const weightItemType = effect.type.slice(5)
      return generateEditItemWeightEffectCode(effect, cleanItemType, sameTypeCount, weightItemType)
    case "fool_effect":
      return generateFoolEffectCode(effect, itemType)
    case "increment_rank":
      return generateIncrementRankEffectCode(effect, itemType)
    case "modify_blind_requirement":
      return generateModifyBlindRequirementEffectCode(effect, cleanItemType)
    case "flip_joker":
      return generateFlipJokerEffectCode(effect)
    case "juice_up_joker":
      return generateJuiceUpEffectCode(effect, sameTypeCount, 'joker')
    case "juice_up_card":
      return generateJuiceUpEffectCode(effect, sameTypeCount, 'card')
    case "level_up_hand":
      return generateLevelUpHandEffectCode(effect, itemType, triggerType, sameTypeCount, joker, card)
    case "force_game_over":
      return generateForceGameOverEffectCode(effect)
    case "fix_probability":
      return generateFixProbabilityEffectCode(effect, sameTypeCount)
    case "mod_probability":
      return generateModProbabilityEffectCode(effect, sameTypeCount)
    case "prevent_game_over":
      return generateSavedEffectCode(effect)
    case "permanent_bonus":
      return generatePermaBonusEffectCode(effect, itemType, sameTypeCount)
    case "play_sound":
      return generatePlaySoundEffectCode(effect, itemType)
    case "redeem_voucher":
      return generateRedeemVoucherEffectCode(effect)
    case "retrigger":
      return generateRetriggerEffectCode(effect, itemType, sameTypeCount, card)
    case "set_sell_value":
      return generateSetSellValueEffectCode(effect, itemType, triggerType, sameTypeCount)
    case "set_dollars":
      return generateSetDollarsEffectCode(effect, cleanItemType, sameTypeCount)
    case "set_ante":
      return generateSetAnteEffectCode(effect, itemType, triggerType, sameTypeCount)
    case "emit_flag":
      return generateEmitFlagEffectCode(effect, modprefix);
    case "win_blind":
      return generateWinBlindEffectCode(effect, itemType)
    case "unlock_joker":
      return generateUnlockJokerEffectCode(effect)
    case "shuffle_jokers":
      return generateShuffleJokersEffectCode(effect)
    case "show_message":
      return generateShowMessageEffectCode(effect)

//////////DECK EXCLUSIVE EFFECTS\\\\\\\\\\\\
    case "edit_starting_cards":
      return generateEditStartingCardsEffectCode(effect, modprefix)
    case "edit_starting_suits":
      return generateEditStartingSuitsEffectCode(effect, modprefix)
    case "edit_starting_ranks":
      return generateEditStartingRanksEffectCode(effect, modprefix)
    case "add_starting_cards":
      return generateAddStartingCardsEffectCode(effect, sameTypeCount, modprefix)
    case "remove_starting_cards":
      return generateRemoveStartingCardsEffectCode(effect, sameTypeCount)
    case "edit_starting_dollars":
      return generateEditStartingDollarsEffectCode(effect)
    
    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
};


export const processPassiveEffects = (
  joker: JokerData
): PassiveEffectResult[] => {
  const passiveEffects: PassiveEffectResult[] = [];

  if (!joker.rules) return passiveEffects;

  joker.rules
    .filter((rule) => rule.trigger === "passive")
    .forEach((rule) => {
      rule.effects?.forEach((effect) => {
        const passiveResult: PassiveEffectResult | null = generateSinglePassiveEffect(effect, joker.objectKey)

        if (passiveResult) {
          passiveEffects.push(passiveResult);
        }
      });
    });

  return passiveEffects;
};

const generateSinglePassiveEffect = (
  effect: Effect,
  jokerKey: string
): PassiveEffectResult | null => {
  switch (effect.type) {
    case "allow_debt":
      return generateAllowDebtPassiveEffectCode(effect)
    case "combine_ranks":
      return generateCombineRanksPassiveEffectCode(effect, jokerKey)
    case "combine_suits":
      return generateCombineSuitsPassiveEffectCode(effect, jokerKey)
    case "copy_joker_ability":
      return generateCopyJokerAbilityPassiveEffectCode(effect)
    case "discount_items":
      return generateDiscountItemsPassiveEffectCode(effect, jokerKey)
    case "free_rerolls":
      return generateFreeRerollsPassiveEffectCode(effect)
    case "disable_boss_blind":
      return generateDisableBossBlindPassiveEffectCode(effect)
    case "edit_discards":
      return generateEditDiscardsPassiveEffectCode(effect)
    case "edit_hands":
      return generateEditHandsPassiveEffectCode(effect)
    case "splash_effect":
      return generateSplashPassiveEffectCode()
    case "edit_consumable_slots":
      return generateEditConsumableSlotsPassiveEffectCode(effect)
    case "edit_joker_slots":
      return generateEditJokerSlotsPassiveEffectCode(effect)
    case "shortcut":
      return generateShortcutPassiveEffectCode(jokerKey)
    case "reduce_flush_straight_requirements":
      return generateReduceFlushStraightRequirementsPassiveEffectCode(effect, jokerKey)
    case "showman":
      return generateShowmanPassiveEffectCode(jokerKey)
    case "edit_voucher_slots": case "edit_booster_slots": case "edit_shop_slots":
    case "edit_hand_size": case "edit_play_size": case "edit_discard_size":
      const type = effect.type.slice(5)
      return generateEditItemSizePassiveEffectCode(effect, type)
    default:
      return null
  }
}

export const extractPreReturnCode = function (
  statement: string
): {
  newStatement: string;
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
      const newStatement = statement
        .replace(
          new RegExp(`${preReturnStart}[\\s\\S]*?${preReturnEnd}`, "g"),
          ""
        )
        .trim();

      return { newStatement, preReturnCode };
    }
  }

  return { newStatement: statement };
}

export const getOrdinalSuffix = (
  num: number
): string => {
  if (num === 2) return "nd";
  if (num === 3) return "rd";
  return "th";
};

const buildReturnStatement = (effects: EffectReturn[]): string => {
  if (effects.length === 0) return "";

  let firstContentEffectIndex = -1;
  for (let i = 0; i < effects.length; i++) {
    const effect = effects[i];
    if (effect.statement.trim().length > 0 || effect.message) {
      firstContentEffectIndex = i;
      break;
    }
  }

  if (firstContentEffectIndex === -1) {
    return "";
  }

  const firstContentEffect = effects[firstContentEffectIndex];
  const hasFirstStatement = firstContentEffect.statement.trim().length > 0;

  let returnStatement = "";

  if (hasFirstStatement) {
    returnStatement = `return {
                    ${firstContentEffect.statement}`;

    if (firstContentEffect.message) {
      returnStatement += `,
                    message = ${firstContentEffect.message}`;
    }
  } else if (firstContentEffect.message) {
    returnStatement = `return {
                    message = ${firstContentEffect.message}`;
  }

  const remainingEffects = effects.slice(firstContentEffectIndex + 1);
  if (remainingEffects.length > 0) {
    let extraChain = "";
    let extraCount = 0;

    for (let i = 0; i < remainingEffects.length; i++) {
      const effect = remainingEffects[i];
      const hasStatement = effect.statement.trim().length > 0;

      let extraContent = "";
      if (hasStatement) {
        extraContent = effect.statement;
        if (effect.message) {
          extraContent += `,
                            message = ${effect.message}`;
        }
      } else if (effect.message) {
        extraContent = `message = ${effect.message}`;
      }

      if (!extraContent) continue;

      if (extraCount === 0) {
        extraChain = `,
                    extra = {
                        ${extraContent}`;

        if (effect.colour && effect.colour.trim()) {
          extraChain += `,
                        colour = ${effect.colour}`;
        }
      } else {
        extraChain += `,
                        extra = {
                            ${extraContent}`;

        if (effect.colour && effect.colour.trim()) {
          extraChain += `,
                            colour = ${effect.colour}`;
        }
      }
      extraCount++;
    }

    for (let i = 0; i < extraCount; i++) {
      extraChain += `
                        }`;
    }

    returnStatement += extraChain;
  }

  returnStatement += `
                }`;

  return returnStatement;
}