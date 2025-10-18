import type { Rule, Condition, ConditionGroup } from "../../ruleBuilder/types";
import { generatePlayerMoneyConditionCode } from "./conditions/PlayerMoneyCondition";
import { generateCardsSelectedConditionCode } from "./conditions/CardsSelectedCondition";
import { generateAnteLevelConditionCode } from "./conditions/AnteLevelCondition";
import { generateHandSizeConditionCode } from "./conditions/HandSizeCondition";
import { generateRemainingHandsConditionCode } from "./conditions/RemainingHandsCondition";
import { generateVoucherRedeemedConditionCode } from "./conditions/VoucherRedeemedCondition";
import { generateConsumableCountConditionCode } from "./conditions/ConsumableCountCondition";
import { generateCheckFlagConditionCode } from "./conditions/CheckFlagCondition";
import { generateInBlindConditionCode } from "./conditions/InBlindCondition";
import { generateBlindTypeConditionCode } from "./conditions/BlindTypeCondition";
import { generateSystemConditionCode } from "./conditions/SystemCondition";
import { generateDrawnHandConditionCode } from "./conditions/DrawnHandCondition";
import { generateGenericCompareConditionCode } from "./conditions/GenericCompareCondition";
import { generateCheckBlindRequirementsConditionCode } from "./conditions/BlindRequirementsCondition";
import { generateCheckDeckConditionCode } from "./conditions/CheckDeckCondition";
import { generateBlindNameConditionCode } from "./conditions/BlindNameCondition";
import { generateDeckCountConditionCode } from "./conditions/DeckCountCondition";
import { generateSpecificJokerConditionCode } from "./conditions/SpecificJokerCondition";
import { generateDeckSizeConditionCode } from "./conditions/DeckSizeCondition";
import { generateJokerFlippedConditionCode } from "./conditions/JokerFlippedCondition";
import {
  generateJokerStickerConditionCode,
} from "./conditions/JokerStickerCondition";
import { generateJokerCountConditionCode } from "./conditions/JokerCountCondition";
import { generateJokerSelectedConditionCode } from "./conditions/JokerSelected";

export const generateConditionChain = (rule: Rule): string => {
  if (!rule.conditionGroups || rule.conditionGroups.length === 0) {
    return "";
  }

  const groupConditions: string[] = [];

  rule.conditionGroups.forEach((group) => {
    const conditions = generateConditionGroupCode(group, rule);
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
  rule: Rule
): string => {
  if (!group.conditions || group.conditions.length === 0) {
    return "";
  }

  const conditionCodes: string[] = [];

  group.conditions.forEach((condition) => {
    const code = generateSingleConditionCode(condition, rule);
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
  rule: Rule
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
    case "player_money":
      return generatePlayerMoneyConditionCode([singleConditionRule]);

    case "cards_selected":
      return generateCardsSelectedConditionCode([singleConditionRule]);

    case "ante_level":
      return generateAnteLevelConditionCode([singleConditionRule]);

    case "hand_size":
      return generateHandSizeConditionCode([singleConditionRule]);

    case "remaining_hands":
      return generateRemainingHandsConditionCode([singleConditionRule]);

    case "joker_selected":
      return generateJokerSelectedConditionCode([singleConditionRule]);

    case "voucher_redeemed":
      return generateVoucherRedeemedConditionCode([singleConditionRule]);
      
    case "blind_type":
      return generateBlindTypeConditionCode([singleConditionRule]);

    case "specific_joker":
      return generateSpecificJokerConditionCode([singleConditionRule]);

    case "joker_count":
      return generateJokerCountConditionCode([singleConditionRule]);

    case "drawn_hand":
      return generateDrawnHandConditionCode([singleConditionRule]);

    case "deck_size":
      return generateDeckSizeConditionCode([singleConditionRule]);

    case "deck_check":
      return generateCheckDeckConditionCode([singleConditionRule]);

    case "check_blind_requirements":
      return generateCheckBlindRequirementsConditionCode([singleConditionRule]);

    case "in_blind":
      return generateInBlindConditionCode([singleConditionRule]);

    case "consumable_count":
      return generateConsumableCountConditionCode([singleConditionRule]);
      
    case "blind_name":
      return generateBlindNameConditionCode([singleConditionRule]);

    case "joker_sticker":
      return generateJokerStickerConditionCode([singleConditionRule]);

    case "joker_flipped":
      return generateJokerFlippedConditionCode();
    
    case "check_flag":
      return generateCheckFlagConditionCode([singleConditionRule]);

    case "deck_count":
      return generateDeckCountConditionCode([singleConditionRule]);

    case "system_condition":
      return generateSystemConditionCode([singleConditionRule]);

    case "generic_compare":
      return generateGenericCompareConditionCode([singleConditionRule]);

    default:
      return null;
  }
};
