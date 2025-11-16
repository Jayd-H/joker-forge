import { JokerData } from "../../data/BalatroUtils";
import { Condition, ConditionGroup, Rule } from "../../ruleBuilder";
import { generateAnteLevelConditionCode } from "../conditions/AnteLevelCondition";
import { generateBlindNameConditionCode } from "../conditions/BlindNameCondition";
import { generateBlindRequirementsConditionCode } from "../conditions/BlindRequirementsCondition";
import { generateBlindTypeConditionCode } from "../conditions/BlindTypeCondition";
import { generateBossBlindTypeConditionCode } from "../conditions/BossBlindTypeCondition";
import { generateCardEditionConditionCode } from "../conditions/CardEditionCondition";
import { generateCardEnhancementConditionCode } from "../conditions/CardEnhancementCondition";
import { generateCardIndexConditionCode } from "../conditions/CardIndexCondition";
import { generateCardSealConditionCode } from "../conditions/CardSealCondition";
import { generateCardsSelectedConditionCode } from "../conditions/CardsSelectedCondition";
import { generateCheckDeckConditionCode } from "../conditions/CheckDeckCondition";
import { generateCheckFlagConditionCode } from "../conditions/CheckFlagCondition";
import { generateConsumableCountConditionCode } from "../conditions/ConsumableCountCondition";
import { generateConsumableTypeConditionCode } from "../conditions/ConsumableTypeCondition";
import { generateDeckCountConditionCode } from "../conditions/DeckCountCondition";
import { generateDeckSizeConditionCode } from "../conditions/DeckSizeCondition";
import { generateDiscardedHandCountConditionCode } from "../conditions/DiscardedHandCountCondition";
import { generateEditionCountConditionCode } from "../conditions/EditionCountCondition";
import { generateEnhancementCountConditionCode } from "../conditions/EnhancementCountCondition";
import { generateFirstDiscardedHandConditionCode } from "../conditions/FirstDiscardedHandCondition";
import { generateFirstPlayedHandConditionCode } from "../conditions/FirstPlayedHandCondition";
import { generateFirstLastScoredConditionCode } from "../conditions/FirstLastScoredCondition";
import { generateGenericCompareConditionCode } from "../conditions/GenericCompareCondition";
import { generateGlassCardDestroyedConditionCode } from "../conditions/GlassCardDestroyedCondition";
import { generateHandCountConditionCode } from "../conditions/HandCountCondition";
import { generateHandLevelConditionCode } from "../conditions/HandLevelCondition";
import { generateHandSizeConditionCode } from "../conditions/HandSizeCondition";
import { generatePokerHandConditionCode } from "../conditions/HandTypeCondition";
import { generateJokerCountConditionCode } from "../conditions/JokerCountCondition";
import { generateJokerFlippedConditionCode } from "../conditions/JokerFlippedCondition";
import { generateJokerKeyConditionCode } from "../conditions/JokerKeyCondition";
import { generateJokerPositionConditionCode } from "../conditions/JokerPositionCondition";
import { generateJokerRarityConditionCode } from "../conditions/JokerRarityCondition";
import { generateJokerSelectedConditionCode } from "../conditions/JokerSelectedCondition";
import { generateJokerStickerConditionCode } from "../conditions/JokerStickerCondition";
import { generateLuckyCardTriggeredConditionCode } from "../conditions/LuckyCardTriggeredCondition";
import { generatePlayerMoneyConditionCode } from "../conditions/PlayerMoneyCondition";
import { generatePokerHandBeenPlayedConditionCode } from "../conditions/PokerHandBeenPlayedCondition";
import { generateProbabilityIdentifierConditionCode } from "../conditions/ProbabilityIdentifierCondition";
import { generateProbabilityPartCompareConditionCode } from "../conditions/ProbabilityPartCompareCondition";
import { generateProbabilitySucceededConditionCode } from "../conditions/ProbabilitySucceededCondition";
import { generateRemainingDiscardsConditionCode } from "../conditions/RemainingDiscardsCondition";
import { generateRemainingHandsConditionCode } from "../conditions/RemainingHandsCondition";
import { generateSealCountConditionCode } from "../conditions/SealCountCondition";
import { generateSystemConditionCode } from "../conditions/SystemCondition";
import { generateTriggeredBossBlindConditionCode } from "../conditions/TriggeredBossBlindCondition";
import { generateVoucherRedeemedConditionCode } from "../conditions/VoucherRedeemedCondition";
import { generateWhichTagConditionCode } from "../conditions/WhichTagCondition";
import { generateCardSuitConditionCode } from "../conditions/CardSuitCondition";
import { generateDiscardedSuitCountConditionCode } from "../conditions/DiscardedSuitCountCondition";
import { generateCardRankConditionCode } from "../conditions/CardRankCondition";
import { generateDiscardedRankCountConditionCode } from "../conditions/DiscardedRankCountCondition";
import { generateGameSpeedConditionCode } from "../conditions/GameSpeed";
import { generateInternalVariableConditionCode } from "../conditions/variableConditions/InternalVariableCondition";
import { generateSuitVariableConditionCode } from "../conditions/variableConditions/SuitVariableCondition";
import { generateRankVariableConditionCode } from "../conditions/variableConditions/RankVariableCondition";
import { generatePokerHandVariableConditionCode } from "../conditions/variableConditions/PokerHandVariableCondition";
import { generateKeyVariableConditionCode } from "../conditions/variableConditions/KeyVariableCondition";
import { generateTextVariableConditionCode } from "../conditions/variableConditions/TextVariableCondition";
import { generateBoosterPackTypeConditionCode } from "../conditions/BoosterPackTypeCondition";


export const generateConditionChain = (
  rule: Rule,
  itemType: string,
  joker?: JokerData,
): string => {
  if (!rule.conditionGroups || rule.conditionGroups.length === 0) {
    return "";
  }

  const groupConditions: string[] = [];

  rule.conditionGroups.forEach((group) => {
    const conditions = generateConditionGroupCode(group, rule, itemType, joker);
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

  return `(${groupConditions.join(") and (")})`;
};

const generateConditionGroupCode = (
  group: ConditionGroup,
  rule: Rule, 
  itemType: string,
  joker?: JokerData,
): string => {
  if (!group.conditions || group.conditions.length === 0) {
    return "";
  }

  const conditionCodes: string[] = [];

  group.conditions.forEach((condition) => {
    const code = generateSingleConditionCode(condition, rule, itemType, joker);
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

export const generateSingleConditionCode = (
  condition: Condition,
  rule: Rule,
  cleanItemType: string,
  joker?: JokerData,
): string | null => {

  const itemType = (cleanItemType === "enhancement" || cleanItemType === "seal" || cleanItemType === "edition") 
    ? "card" : cleanItemType

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
    case "ante_level":
      return generateAnteLevelConditionCode([singleConditionRule])
    case "blind_name":
      return generateBlindNameConditionCode([singleConditionRule])
    case "blind_requirement":
      return generateBlindRequirementsConditionCode([singleConditionRule])
    case "blind_type":
      return generateBlindTypeConditionCode([singleConditionRule])
    case "boss_blind_type":
      return generateBossBlindTypeConditionCode([singleConditionRule])
    case "card_edition":
      return generateCardEditionConditionCode([singleConditionRule], itemType)
    case "card_enhancement":
      return generateCardEnhancementConditionCode([singleConditionRule], itemType)
    case "card_index":
      return generateCardIndexConditionCode([singleConditionRule], cleanItemType)
    case "card_suit":
      return generateCardSuitConditionCode([singleConditionRule], itemType, joker)
    case "card_rank":
      return generateCardRankConditionCode([singleConditionRule], itemType, joker)
    case "card_seal":
      return generateCardSealConditionCode([singleConditionRule], itemType)
    case "cards_selected":
      return generateCardsSelectedConditionCode([singleConditionRule], itemType)
    case "check_deck":
      return generateCheckDeckConditionCode([singleConditionRule])
    case "check_flag":
      return generateCheckFlagConditionCode([singleConditionRule])
    case "consumable_count":
      return generateConsumableCountConditionCode([singleConditionRule])
    case "consumable_type":
      return generateConsumableTypeConditionCode([singleConditionRule], itemType)
    case "deck_count":
      return generateDeckCountConditionCode([singleConditionRule])
    case "deck_size":
      return generateDeckSizeConditionCode([singleConditionRule])
    case "discarded_card_count":
      return generateDiscardedHandCountConditionCode([singleConditionRule], itemType)
    case "discarded_suit_count":
      return generateDiscardedSuitCountConditionCode([singleConditionRule], itemType, joker)
    case "discarded_rank_count":
      return generateDiscardedRankCountConditionCode([singleConditionRule], itemType)
    case "edition_count":
      return generateEditionCountConditionCode([singleConditionRule], itemType)
    case "enchancement_count":
      return generateEnhancementCountConditionCode([singleConditionRule], itemType)
    case "first_discarded_hand":
      return generateFirstDiscardedHandConditionCode()
    case "first_played_hand":
      return generateFirstPlayedHandConditionCode()
    case "first_last_scored":
      return generateFirstLastScoredConditionCode([singleConditionRule], itemType, joker)
    case "generic_compare":
      return generateGenericCompareConditionCode([singleConditionRule])
    case "glass_card_destroyed":
      return generateGlassCardDestroyedConditionCode()
    case "hand_count":
      return generateHandCountConditionCode([singleConditionRule])
    case "hand_level":
      return generateHandLevelConditionCode([singleConditionRule])
    case "hand_type":
      return generatePokerHandConditionCode([singleConditionRule], itemType, joker)
    case "hand_size":
      return generateHandSizeConditionCode([singleConditionRule])
    case "internal_variable":
      return generateInternalVariableConditionCode([singleConditionRule])
    case "suit_variable":
      return generateSuitVariableConditionCode([singleConditionRule])
    case "rank_variable":
      return generateRankVariableConditionCode([singleConditionRule])
    case "pokerhand_variable":
      return generatePokerHandVariableConditionCode([singleConditionRule])
    case "key_variable":
      return generateKeyVariableConditionCode([singleConditionRule])
    case "text_variable":
      return generateTextVariableConditionCode([singleConditionRule])
    case "joker_count":
      return generateJokerCountConditionCode([singleConditionRule])
    case "joker_flipped":
      return generateJokerFlippedConditionCode(itemType, "other")
    case "this_joker_flipped":
      return generateJokerFlippedConditionCode(itemType, "self")
    case "joker_specific":
      return generateJokerKeyConditionCode([singleConditionRule], itemType)
    case "joker_index":
      return generateJokerPositionConditionCode([singleConditionRule], itemType, "other")
    case "this_joker_index":
      return generateJokerPositionConditionCode([singleConditionRule], itemType, "self")
    case "joker_rarity":
      return generateJokerRarityConditionCode([singleConditionRule], itemType)
    case "joker_selected":
      return generateJokerSelectedConditionCode([singleConditionRule])
    case "joker_sticker":
      return generateJokerStickerConditionCode([singleConditionRule], itemType, "other")
    case "this_joker_sticker":
      return generateJokerStickerConditionCode([singleConditionRule], itemType, "self")
    case "lucky_card_triggered":
      return generateLuckyCardTriggeredConditionCode()
    case "player_money":
      return generatePlayerMoneyConditionCode([singleConditionRule])
    case "poker_hand_been_played":
      return generatePokerHandBeenPlayedConditionCode()
    case "probability_identifier":
      return generateProbabilityIdentifierConditionCode([singleConditionRule], itemType)
    case "probability_part_compare":
      return generateProbabilityPartCompareConditionCode([singleConditionRule])
    case "probability_succeeded":
      return generateProbabilitySucceededConditionCode([singleConditionRule])
    case "remaining_discards":
      return generateRemainingDiscardsConditionCode([singleConditionRule])
    case "remaining_hands":
      return generateRemainingHandsConditionCode([singleConditionRule])
    case "seal_count":
      return generateSealCountConditionCode([singleConditionRule], itemType)
    case "system_condition":
      return generateSystemConditionCode([singleConditionRule])
    case "triggered_boss_blind":
      return generateTriggeredBossBlindConditionCode()
    case "voucher_redeemed":
      return generateVoucherRedeemedConditionCode([singleConditionRule])
    case "which_tag":
      return generateWhichTagConditionCode([singleConditionRule])
    case "game_speed":
      return generateGameSpeedConditionCode([singleConditionRule])
    case "booster_type":
      return generateBoosterPackTypeConditionCode([singleConditionRule], itemType, rule.trigger)
      
  }
  return null
}