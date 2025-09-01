import type { Rule, Condition, ConditionGroup } from "../../ruleBuilder/types";
import type { JokerData } from "../../data/BalatroUtils";
import { generatePokerHandConditionCode } from "./conditions/PokerHandCondition";
import {
  generateSuitCardConditionCode,
  generateDiscardedSuitConditionCode,
} from "./conditions/SuitCardCondition";
import {
  generateRankCardConditionCode,
  generateDiscardedRankConditionCode,
} from "./conditions/RankCardCondition";
import {
  generateCountCardConditionCode,
  generateDiscardedCardCountConditionCode,
} from "./conditions/CountHandCondition";
import { generatePlayerMoneyConditionCode } from "./conditions/PlayerMoneyCondition";
import { generateRemainingHandsConditionCode } from "./conditions/RemainingHandsCondition";
import { generateRemainingDiscardsConditionCode } from "./conditions/RemainingDiscardsCondition";
import { generateJokerCountConditionCode } from "./conditions/JokerCountCondition";
import { generateBlindTypeConditionCode } from "./conditions/BlindTypeCondition";
import { generateCardEnhancementConditionCode } from "./conditions/CardEnhancementCondition";
import { generateEnhancementCountConditionCode } from "./conditions/EnhancementCountCondition";
import { generateCardSealConditionCode } from "./conditions/CardSealCondition";
import { generateSealCountConditionCode } from "./conditions/SealCountCondition";
import { generateInternalVariableConditionCode } from "./conditions/InternalVariableCondition";
import { generateFirstPlayedHandConditionCode } from "./conditions/FirstHandPlayedCondition";
import { generateFirstDiscardedHandConditionCode } from "./conditions/FirstDiscardedHandCondition";
import { generateAnteLevelConditionCode } from "./conditions/AnteLevelCondition";
import { generateHandSizeConditionCode } from "./conditions/HandSizeCondition";
import { generateDeckSizeConditionCode } from "./conditions/DeckSizeCondition";
import { generateDeckCountConditionCode } from "./conditions/DeckCountCondition";
import { generateCardEditionConditionCode } from "./conditions/CardEditionCondition";
import { generateEditionCountConditionCode } from "./conditions/EditionCountCondition";
import { generateSpecificJokerConditionCode } from "./conditions/SpecificJokerCondition";
import { generateGenericCompareConditionCode } from "./conditions/GenericCompareCondition";
import { generateConsumableCountConditionCode } from "./conditions/ConsumableCountCondition";
import { generateCheckBlindRequirementsConditionCode } from "./conditions/BlindRequirementsCondition";
import { generateGlassCardDestroyedConditionCode } from "./conditions/GlassCardDestroyedCondition";
import { generateConsumableTypeConditionCode } from "./conditions/ConsumableTypeCondition";
import { generatePokerHandBeenPlayedConditionCode } from "./conditions/PokerHandBeenPlayedCondition";
import { generateTriggeredBossBlindConditionCode } from "./conditions/TriggeredBossBlindCondition";
import { generateLuckyCardTriggeredConditionCode } from "./conditions/LuckyCardTriggeredCondition";
import { generateCardIndexConditionCode } from "./conditions/CardIndexCondition";
import { generateProbabilityIdentifierConditionCode } from "./conditions/ProbabilityIdentifierCondition";
import { generateProbabilityPartCompareConditionCode } from "./conditions/ProbabilityPartCompareCondition";
import { generateHandLevelConditionCode } from "./conditions/HandLevelCondition";
import { generateCumulativeChipsConditionCode } from "./conditions/CumulativeChipsCondition";
import { generateBlindNameConditionCode } from "./conditions/BlindNameCondition";
import { generateFirstLastScoredConditionCode } from "./conditions/FirstLastScoredCondition";
import { generateProbabilitySucceededConditionCode } from "./conditions/ProbabilitySucceededCondition";
import { generateVoucherRedeemedConditionCode } from "./conditions/VoucherRedeemedCondition";
import { generateJokerRarityConditionCode } from "./conditions/JokerRarityCondition";
import {
  generateJokerStickerConditionCode,
  generateThisJokerStickerConditionCode,
} from "./conditions/JokerStickerCondition";
import {
  generateJokerPositionConditionCode,
  generateThisJokerPositionConditionCode,
} from "./conditions/JokerPositionCondition";
import { generateJokerKeyConditionCode } from "./conditions/JokerKeyCondition";
import { generateCheckFlagConditionCode } from "./conditions/CheckFlagCondition";
import { generateBossBlindTypeConditionCode } from "./conditions/BossBlindTypeCondition";
import { generateJokerFlippedConditionCode, generateThisJokerFlippedConditionCode } from "./conditions/JokerFlippedCondition";
import { generateWhichTagConditionCode } from "./conditions/WhichTagCondition";

export const generateConditionChain = (
  rule: Rule,
  joker?: JokerData
): string => {
  if (!rule.conditionGroups || rule.conditionGroups.length === 0) {
    return "";
  }

  const groupConditions: string[] = [];

  rule.conditionGroups.forEach((group) => {
    const conditions = generateConditionGroupCode(group, rule, joker);
    if (conditions) {
      groupConditions.push(conditions);
    }
  });

  if (groupConditions.length === 0) {
    return "";
  }

  if (groupConditions.length === 1) {
    return groupConditions[0];
  }

  let result = groupConditions[0];
  for (let i = 1; i < groupConditions.length; i++) {
    const prevGroup = rule.conditionGroups[i - 1];
    const operator = prevGroup.operator === "or" ? " or " : " and ";
    result += operator + groupConditions[i];
  }

  return `(${result})`;
};

const generateConditionGroupCode = (
  group: ConditionGroup,
  rule: Rule,
  joker?: JokerData
): string => {
  if (!group.conditions || group.conditions.length === 0) {
    return "";
  }

  const conditionCodes: string[] = [];

  group.conditions.forEach((condition) => {
    const code = generateSingleConditionCode(condition, rule, joker);
    if (code) {
      let finalCode = code;

      if (condition.negate) {
        finalCode = `not (${code})`;
      }

      conditionCodes.push(finalCode);
    }
  });

  if (conditionCodes.length === 0) {
    return "";
  }

  if (conditionCodes.length === 1) {
    return conditionCodes[0];
  }

  let result = conditionCodes[0];
  for (let i = 1; i < conditionCodes.length; i++) {
    const prevCondition = group.conditions[i - 1];
    const operator = prevCondition.operator === "or" ? " or " : " and ";
    result += operator + conditionCodes[i];
  }

  return `(${result})`;
};

const generateSingleConditionCode = (
  condition: Condition,
  rule: Rule,
  joker?: JokerData
): string | null => {
  const singleConditionRule = {
    ...rule,
    conditionGroups: [
      {
        ...rule.conditionGroups[0],
        conditions: [condition],
      },
    ],
  };

  switch (condition.type) {
    case "hand_type":
      return generatePokerHandConditionCode([singleConditionRule], joker);

    case "suit_count":
    case "card_suit":
      return generateSuitCardConditionCode([singleConditionRule], joker);

    case "discarded_suit_count":
      return generateDiscardedSuitConditionCode([singleConditionRule], joker);

    case "rank_count":
    case "card_rank":
      return generateRankCardConditionCode([singleConditionRule], joker);

    case "discarded_rank_count":
      return generateDiscardedRankConditionCode([singleConditionRule], joker);

    case "card_count":
      return generateCountCardConditionCode([singleConditionRule]);

    case "discarded_card_count":
      return generateDiscardedCardCountConditionCode([singleConditionRule]);

    case "enhancement_count":
      return generateEnhancementCountConditionCode([singleConditionRule]);

    case "card_enhancement":
      return generateCardEnhancementConditionCode([singleConditionRule]);

    case "seal_count":
      return generateSealCountConditionCode([singleConditionRule]);

    case "card_seal":
      return generateCardSealConditionCode([singleConditionRule]);

    case "player_money":
      return generatePlayerMoneyConditionCode([singleConditionRule]);

    case "remaining_hands":
      return generateRemainingHandsConditionCode([singleConditionRule]);

    case "remaining_discards":
      return generateRemainingDiscardsConditionCode([singleConditionRule]);

    case "joker_count":
      return generateJokerCountConditionCode([singleConditionRule]);

    case "hand_level":
      return generateHandLevelConditionCode([singleConditionRule]);

    case "blind_type":
      return generateBlindTypeConditionCode([singleConditionRule]);

    case "internal_variable":
      return generateInternalVariableConditionCode([singleConditionRule]);

    case "check_flag":
      return generateCheckFlagConditionCode([singleConditionRule]);

    case "first_played_hand":
      return generateFirstPlayedHandConditionCode();

    case "first_discarded_hand":
      return generateFirstDiscardedHandConditionCode();

    case "ante_level":
      return generateAnteLevelConditionCode([singleConditionRule]);

    case "hand_size":
      return generateHandSizeConditionCode([singleConditionRule]);

    case "deck_size":
      return generateDeckSizeConditionCode([singleConditionRule]);

    case "deck_count":
      return generateDeckCountConditionCode([singleConditionRule]);

    case "card_edition":
      return generateCardEditionConditionCode([singleConditionRule]);

    case "edition_count":
      return generateEditionCountConditionCode([singleConditionRule]);

    case "specific_joker":
      return generateSpecificJokerConditionCode([singleConditionRule]);

    case "generic_compare":
      return generateGenericCompareConditionCode([singleConditionRule]);

    case "consumable_count":
      return generateConsumableCountConditionCode([singleConditionRule]);

    case "check_blind_requirements":
      return generateCheckBlindRequirementsConditionCode([singleConditionRule]);

    case "glass_card_destroyed":
      return generateGlassCardDestroyedConditionCode();

    case "consumable_type":
      return generateConsumableTypeConditionCode([singleConditionRule]);

    case "poker_hand_been_played":
      return generatePokerHandBeenPlayedConditionCode();

    case "cumulative_chips":
      return generateCumulativeChipsConditionCode([singleConditionRule]);

    case "triggered_boss_blind":
      return generateTriggeredBossBlindConditionCode();

    case "lucky_card_triggered":
      return generateLuckyCardTriggeredConditionCode();

    case "probability_identifier":
      return generateProbabilityIdentifierConditionCode([singleConditionRule]);

    case "probability_part_compare":
      return generateProbabilityPartCompareConditionCode([singleConditionRule]);

    case "card_index":
      return generateCardIndexConditionCode([singleConditionRule]);

    case "blind_name":
      return generateBlindNameConditionCode([singleConditionRule]);

    case "first_last_scored":
      return generateFirstLastScoredConditionCode([singleConditionRule], joker);

    case "probability_succeeded":
      return generateProbabilitySucceededConditionCode([singleConditionRule]);

    case "voucher_redeemed":
      return generateVoucherRedeemedConditionCode([singleConditionRule]);

    case "joker_specific":
      return generateJokerKeyConditionCode([singleConditionRule]);

    case "joker_rarity":
      return generateJokerRarityConditionCode([singleConditionRule]);

    case "joker_index":
      return generateJokerPositionConditionCode([singleConditionRule]);
    case "this_joker_index":
      return generateThisJokerPositionConditionCode([singleConditionRule]);

    case "joker_sticker":
      return generateJokerStickerConditionCode([singleConditionRule]);
    case "this_joker_sticker":
      return generateThisJokerStickerConditionCode([singleConditionRule]);
    
    case "joker_flipped":
      return generateJokerFlippedConditionCode();
    case "this_joker_flipped":
      return generateThisJokerFlippedConditionCode();

    case "boss_blind_type":
      return generateBossBlindTypeConditionCode([singleConditionRule]);

    case "which_tag":
      return generateWhichTagConditionCode([singleConditionRule]);

    default:
      return null;
  }
};
