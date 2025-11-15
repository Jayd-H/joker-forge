import type { Effect, LoopGroup, RandomGroup } from "../../ruleBuilder/types";
import { generateEditHandSizeReturn } from "./effects/EditHandSizeEffect";
import { generateEditHandsReturn } from "./effects/EditHandsEffect";
import { generateEditDiscardsReturn } from "./effects/EditDiscardsEffect";
import { generateSetAnteReturn } from "./effects/SetAnteEffect";
import { 
  generateEditDollarsSelectedReturn,
  generateEditDollarsCalculateReturn,
 } from "./effects/AddDollarsEffect";
import { generateEditPlaySizeReturn } from "./effects/EditPlaySizeEffect";
import { generateEditDiscardSizeReturn } from "./effects/EditDiscardSizeEffect";
import { generateEditEndRoundDiscardMoneyReturn } from "./effects/EditEndRoundDiscardMoneyEffect";
import { generateEditEndRoundHandMoneyReturn } from "./effects/EditEndRoundHandMoneyEffect";
import { generateEditBoosterSlotsReturn } from "./effects/EditBoosterSlotsEffect";
import { generateEditVoucherSlotsReturn } from "./effects/EditVoucherSlotsEffect";
import { generateEditInterestCapReturn } from "./effects/EditInterntCapEffect";
import { generateEditJokerSlotsReturn } from "./effects/EditJokerSlotsEffect";
import { generateEditStartingCardsReturn } from "./effects/EditStartingCardsEffect";
import { generateEditStartingSuitsReturn } from "./effects/EditStartingSuitsEffect";
import { generateEditStartingRanksReturn } from "./effects/EditStartingRanksEffect";
import { generateAddStartingCardsReturn } from "./effects/AddStartingCardsEffect";
import { generateRemoveStartingCardsReturn } from "./effects/RemoveStartingCardsEffect";
import { generateCreateJokerReturn } from "./effects/CreateJokerEffect";
import { generateCreateConsumableReturn } from "./effects/CreateConsumableEffect";
import { generateCreateTagReturn } from "./effects/CreateTagEffect";
import { generateEditItemWeightReturn } from "./effects/EditItemWeightEffect";
import { generateEditWinnerAnteReturn } from "./effects/EditWinnerAnteEffect";
import { generateEditApperanceReturn } from "./effects/EditCardApperance";
import { generateEditRarityWeightReturn } from "./effects/EditRarityWeightEffect";
import { generateEditBoostersReturn } from "./effects/EditBoostersPacksEffect";
import { generateModifyBlindRequirementReturn } from "./effects/ModifyBlindRequirementEffect";
import { generateEditRellorPriceReturn } from "./effects/EditRellorPriceEffect";
import {
  generateConsumableSlots,
} from "./effects/EditConsumableSlotsEffect";
import { generateEditShopCardsSlotsReturn } from "./effects/EditShopCardsSlotsEffect";
import { generateEmitFlagReturn } from "./effects/EmitFlagEffect";
import { generateFreeRerollsReturn} from "./effects/DiscountItemsEffect";
import { generatePlaySoundReturn } from "./effects/PlaySoundEffect";

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

export function generateEffectReturnStatement(
  regularEffects: Effect[] = [],
  randomGroups: RandomGroup[] = [],
  loopGroups: LoopGroup[] = [],
  modprefix: string,
  deckKey?: string
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
      mainReturnStatement = buildDeckEffectCode(processedEffects);
      primaryColour = processedEffects[0]?.colour ?? "G.C.WHITE";
    }
  }

  if (randomGroups.length > 0) {
    const denominators = [
      ...new Set(randomGroups.map((group) => group.chance_denominator as number)),
    ];
    const denominatorToOddsVar: Record<number, string> = {};

    if (denominators.length === 1) {
      denominatorToOddsVar[denominators[0]] = "self.config.odds";
      const oddsVar = "odds = " + denominators[0];
      if (!configVariableSet.has(oddsVar)) {
        configVariableSet.add(oddsVar);
        allConfigVariables.push(oddsVar);
      }
    } else {
      denominators.forEach((denom, index) => {
        if (index === 0) {
          denominatorToOddsVar[denom] = "self.config.odds";
          const oddsVar = "odds = " + denom;
          if (!configVariableSet.has(oddsVar)) {
            configVariableSet.add(oddsVar);
            allConfigVariables.push(oddsVar);
          }
        } else {
          denominatorToOddsVar[denom] = `self.config.odds${index + 1}`;
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

      const probabilityStatement = `SMODS.pseudorandom_probability(back, '${probabilityIdentifier}', ${group.chance_numerator}, ${oddsVar}, '${group.custom_key || `b_${modprefix}_${deckKey}`}', ${group.respect_probability_effects === false})`
      
      const groupStatement = `if ${probabilityStatement} then
                ${fullGroupContent}
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

    if (repetitions.length === 1) {
      repetitionsToVar[repetitions[0]] = "self.config.repetitions";
      const repetitionsVar = "repetitions = " + repetitions[0];
      if (!(typeof repetitions[0] === "string") && !configVariableSet.has(repetitionsVar)) {
        configVariableSet.add(repetitionsVar);
        allConfigVariables.push(repetitionsVar);
      }
    }

    loopGroups.forEach((group) => {
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

      const loopStatement = `
      for i=1, ${group.repetitions} do`;
      
      const groupStatement = `${loopStatement}
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

    case "edit_dollars_selected":
      return generateEditDollarsSelectedReturn(effect);

      case "edit_dollars_calculate":
      return generateEditDollarsCalculateReturn(effect);

    case "edit_hand_size":
      return generateEditHandSizeReturn(effect);

    case "edit_hands":
      return generateEditHandsReturn(effect);

    case "edit_discards":
      return generateEditDiscardsReturn(effect);

      case "edit_hands_money":
      return generateEditEndRoundHandMoneyReturn(effect);

    case "edit_discards_money":
      return generateEditEndRoundDiscardMoneyReturn(effect);

    case "set_ante":
      return generateSetAnteReturn(effect);

    case "edit_play_size":
      return generateEditPlaySizeReturn(effect);

    case "modify_base_blind_requirement":
      return generateModifyBlindRequirementReturn(effect);

    case "free_rerolls":
      return generateFreeRerollsReturn(effect);
    
    case "edit_rerolls":
      return generateEditRellorPriceReturn(effect);

    case "edit_win_ante":
      return generateEditWinnerAnteReturn(effect);

    case "edit_all_starting_cards":
      return generateEditStartingCardsReturn(effect);

    case "edit_starting_suits":
      return generateEditStartingSuitsReturn(effect);

    case "create_tag":
      return generateCreateTagReturn(effect);

    case "edit_starting_ranks":
      return generateEditStartingRanksReturn(effect);

    case "add_starting_cards":
       return generateAddStartingCardsReturn(effect);

    case "remove_starting_cards":
       return generateRemoveStartingCardsReturn(effect);

    case "edit_discard_size":
      return generateEditDiscardSizeReturn(effect);

    case "create_joker":
      return generateCreateJokerReturn(effect, modprefix);
        
    case "create_consumable":
      return generateCreateConsumableReturn(effect);

    case "edit_booster_slots":
      return generateEditBoosterSlotsReturn(effect);

    case "edit_shop_slots":
      return generateEditShopCardsSlotsReturn(effect);
      
    case "edit_consumable_slots":
      return generateConsumableSlots(effect);

    case "edit_voucher_slots":
      return generateEditVoucherSlotsReturn(effect);

      case "edit_booster_packs":
      return generateEditBoostersReturn(effect);

    case "edit_joker_slots":
      return generateEditJokerSlotsReturn(effect);
    
    case "edit_item_weight":
      return generateEditItemWeightReturn(effect);
      
    case "edit_card_apperance":
      return generateEditApperanceReturn(effect);

    case "edit_raity_weight":
      return generateEditRarityWeightReturn(effect); 

    case "edit_interest_cap":
      return generateEditInterestCapReturn(effect);  

    case "emit_flag":
      return generateEmitFlagReturn(effect, modprefix);
          
    case "play_sound":
      return generatePlaySoundReturn(effect);
      

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
};

const buildDeckEffectCode = (effects: EffectReturn[]): string => {
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
