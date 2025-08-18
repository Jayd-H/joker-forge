import type { Rule, Condition, ConditionGroup } from "../../ruleBuilder/types";
import { generatePlayerMoneyConditionCode } from "./conditions/PlayerMoneyCondition";
import { generateCardRankConditionCode } from "./conditions/CardRankCondition";
import { generateCardSuitConditionCode } from "./conditions/CardSuitCondition";
import { generateCardEditionConditionCode } from "./conditions/CardEditionCondition";
import { generateCardSealConditionCode } from "./conditions/CardSealCondition";
import { generateCardIndexConditionCode } from "./conditions/CardIndexCondition";
import { generateBlindTypeConditionCode } from "./conditions/BlindTypeCondition";
import { generateAnteLevelConditionCode } from "./conditions/AnteLevelCondition";
import { generateHandSizeConditionCode } from "./conditions/HandSizeCondition";
import { generateRemainingHandsConditionCode } from "./conditions/RemainingHandsCondition";
import { generateRemainingDiscardsConditionCode } from "./conditions/RemainingDiscardsCondition";
import { generateFirstPlayedHandConditionCode } from "./conditions/FirstPlayedHandCondition";
import { generatePokerHandConditionCode } from "./conditions/PokerHandCondition";
import { generateHandLevelConditionCode } from "./conditions/HandLevelCondition";
import { generateBlindRequirementsConditionCode } from "./conditions/BlindRequirementsCondition";
import { generateJokerCountConditionCode } from "./conditions/JokerCountCondition";
import { generateSpecificJokerConditionCode } from "./conditions/SpecificJokerCondition";
import { generateDeckSizeConditionCode } from "./conditions/DeckSizeCondition";
import { generateVoucherRedeemedConditionCode } from "./conditions/VoucherRedeemedCondition";
import { generateTriggeredBossBlindConditionCode } from "./conditions/TriggeredBossBlindCondition";
import { generateInternalVariableConditionCode } from "./conditions/InternalVariableCondition";

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

    case "card_rank":
      return generateCardRankConditionCode([singleConditionRule]);

    case "card_suit":
      return generateCardSuitConditionCode([singleConditionRule]);

    case "card_edition":
      return generateCardEditionConditionCode([singleConditionRule]);

    case "card_seal":
      return generateCardSealConditionCode([singleConditionRule]);

    case "card_index":
      return generateCardIndexConditionCode([singleConditionRule]);

    case "blind_type":
      return generateBlindTypeConditionCode([singleConditionRule]);

    case "ante_level":
      return generateAnteLevelConditionCode([singleConditionRule]);

    case "hand_size":
      return generateHandSizeConditionCode([singleConditionRule]);

    case "remaining_hands":
      return generateRemainingHandsConditionCode([singleConditionRule]);

    case "remaining_discards":
      return generateRemainingDiscardsConditionCode([singleConditionRule]);

    case "first_played_hand":
      return generateFirstPlayedHandConditionCode();

    case "poker_hand":
      return generatePokerHandConditionCode([singleConditionRule]);

    case "hand_level":
      return generateHandLevelConditionCode([singleConditionRule]);

    case "blind_requirements":
      return generateBlindRequirementsConditionCode([singleConditionRule]);

    case "joker_count":
      return generateJokerCountConditionCode([singleConditionRule]);

    case "specific_joker":
      return generateSpecificJokerConditionCode([singleConditionRule]);

    case "deck_size":
      return generateDeckSizeConditionCode([singleConditionRule]);

    case "voucher_redeemed":
      return generateVoucherRedeemedConditionCode([singleConditionRule]);

    case "triggered_boss_blind":
      return generateTriggeredBossBlindConditionCode();

    case "internal_variable":
      return generateInternalVariableConditionCode([singleConditionRule]);

    default:
      return null;
  }
};
