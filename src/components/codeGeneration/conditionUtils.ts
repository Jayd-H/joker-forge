import { ConsumableData, DeckData, EditionData, EnhancementData, JokerData, SealData, VoucherData } from "../data/BalatroUtils";
import { Condition, Rule } from "../ruleBuilder";
import { generateAnteLevelConditionCode } from "./Conditions/AnteLevelCondition";
import { generateBlindNameConditionCode } from "./Conditions/BlindNameCondition";
import { generateBlindRequirementsConditionCode } from "./Conditions/BlindRequirementsCondition";
import { generateBlindTypeConditionCode } from "./Conditions/BlindTypeCondition";
import { generateBossBlindTypeConditionCode } from "./Conditions/BossBlindTypeCondition";
import { generateCardEditionConditionCode } from "./Conditions/CardEditionCondition";
import { generateCardEnhancementConditionCode } from "./Conditions/CardEnhancementCondition";
import { generateCardIndexConditionCode } from "./Conditions/CardIndexCondition";
import { generatePokerHandConditionCode } from "./Conditions/PokerHandCondition";
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


export const generateSingleConditionCode = (
  condition: Condition,
  rule: Rule,
  itemType: string,
  joker?: JokerData,
  consumable?: ConsumableData,
  card?: EnhancementData | EditionData | SealData,
  voucher?: VoucherData,
  deck?: DeckData,
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
    // ADD CASE FOR card_rank AND card_suit
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
    case "edition_count":
      return generateEditionCountConditionCode([singleConditionRule], itemType)
    case "enchancement_count":
      return generateEnhancementCountConditionCode([singleConditionRule], itemType)
    case "hand_type":
      return generatePokerHandConditionCode([singleConditionRule], itemType, joker)
  }
  return null
}