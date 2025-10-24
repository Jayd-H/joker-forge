import { JokerData, } from "../data/BalatroUtils";
import { Condition, Rule } from "../ruleBuilder";
import { generateAnteLevelConditionCode } from "./Conditions/AnteLevelCondition";
import { generateBlindNameConditionCode } from "./Conditions/BlindNameCondition";
import { generateBlindRequirementsConditionCode } from "./Conditions/BlindRequirementsCondition";
import { generateBlindTypeConditionCode } from "./Conditions/BlindTypeCondition";
import { generateBossBlindTypeConditionCode } from "./Conditions/BossBlindTypeCondition";
import { generateCardEditionConditionCode } from "./Conditions/CardEditionCondition";
import { generateCardEnhancementConditionCode } from "./Conditions/CardEnhancementCondition";
import { generateCardIndexConditionCode } from "./Conditions/CardIndexCondition";
import { generateCardSealConditionCode } from "./Conditions/CardSealCondition";
import { generateCardsSelectedConditionCode } from "./Conditions/CardsSelectedCondition";
import { generateCheckDeckConditionCode } from "./Conditions/CheckDeckCondition";
import { generateCheckFlagConditionCode } from "./Conditions/CheckFlagCondition";
import { generateConsumableCountConditionCode } from "./Conditions/ConsumableCountCondition";
import { generateConsumableTypeConditionCode } from "./Conditions/ConsumableTypeCondition";
import { generateDeckCountConditionCode } from "./Conditions/DeckCountCondition";
import { generateDeckSizeConditionCode } from "./Conditions/DeckSizeCondition";
import { generateDiscardedHandCountConditionCode } from "./Conditions/DiscardedHandCountCondition";
import { generateEditionCountConditionCode } from "./Conditions/EditionCountCondition";
import { generateEnhancementCountConditionCode } from "./Conditions/EnhancementCountCondition";
import { generateFirstDiscardedHandConditionCode } from "./Conditions/FirstDiscardedHandCondition";
import { generateFirstPlayedHandConditionCode } from "./Conditions/FirstPlayedHandCondition";
import { generateFirstLastScoredConditionCode } from "./Conditions/FirstLastScoredCondition";
import { generateGenericCompareConditionCode } from "./Conditions/GenericCompareCondition";
import { generateGlassCardDestroyedConditionCode } from "./Conditions/GlassCardDestroyedCondition";
import { generateHandCountConditionCode } from "./Conditions/HandCountCondition";
import { generateHandLevelConditionCode } from "./Conditions/HandLevelCondition";
import { generateHandSizeConditionCode } from "./Conditions/HandSizeCondition";
import { generateInternalVariableConditionCode } from "./Conditions/InternalVariableCondition";
import { generatePokerHandConditionCode } from "./Conditions/HandTypeCondition";
import { generateJokerCountConditionCode } from "./Conditions/JokerCountCondition";
import { generateJokerFlippedConditionCode } from "./Conditions/JokerFlippedCondition";
import { generateJokerKeyConditionCode } from "./Conditions/JokerKeyCondition";
import { generateJokerPositionConditionCode } from "./Conditions/JokerPositionCondition";
import { generateJokerRarityConditionCode } from "./Conditions/JokerRarityCondition";
import { generateJokerSelectedConditionCode } from "./Conditions/JokerSelectedCondition";
import { generateJokerStickerConditionCode } from "./Conditions/JokerStickerCondition";
import { generateLuckyCardTriggeredConditionCode } from "./Conditions/LuckyCardTriggeredCondition";
import { generatePlayerMoneyConditionCode } from "./Conditions/PlayerMoneyCondition";
import { generatePokerHandBeenPlayedConditionCode } from "./Conditions/PokerHandBeenPlayedCondition";
import { generateProbabilityIdentifierConditionCode } from "./Conditions/ProbabilityIdentifierCondition";
import { generateProbabilityPartCompareConditionCode } from "./Conditions/ProbabilityPartCompareCondition";
import { generateProbabilitySucceededConditionCode } from "./Conditions/ProbabilitySucceededCondition";
import { generateRemainingDiscardsConditionCode } from "./Conditions/RemainingDiscardsCondition";
import { generateRemainingHandsConditionCode } from "./Conditions/RemainingHandsCondition";
import { generateSealCountConditionCode } from "./Conditions/SealCountCondition";
import { generateSystemConditionCode } from "./Conditions/SystemCondition";
import { generateTriggeredBossBlindConditionCode } from "./Conditions/TriggeredBossBlindCondition";
import { generateVoucherRedeemedConditionCode } from "./Conditions/VoucherRedeemedCondition";
import { generateWhichTagConditionCode } from "./Conditions/WhichTagCondition";
import { generateCardSuitConditionCode } from "./Conditions/CardSuitCondition";
import { generateDiscardedSuitCountConditionCode } from "./Conditions/DiscardedSuitCountCondition";
import { generateCardRankConditionCode } from "./Conditions/CardRankCondition";
import { generateDiscardedRankCountConditionCode } from "./Conditions/DiscardedRankCountCondition";


export const generateSingleConditionCode = (
  condition: Condition,
  rule: Rule,
  itemType: string,
  joker?: JokerData,
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
      return generateCardIndexConditionCode([singleConditionRule], itemType)
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
  }
  return null
}