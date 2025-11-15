// @ts-nocheck
// Make sure to Remove the Error Checker Bypass When Copying This File

import type { Rule } from "../../ruleBuilder/types";
import type { ConsumableData, DeckData, EditionData, EnhancementData, JokerData, SealData, VoucherData } from "../../data/BalatroUtils";

export const generateConditionCode = (
  rules: Rule[],
  itemType: string,
  joker?: JokerData,
  consumable?: ConsumableData,
  card?: EnhancementData | EditionData | SealData,
  voucher?: VoucherData,
  deck?: DeckData,
):string | null => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(rules, joker)
    case "consumable":
      return generateConsumableCode(rules, consumable)
    case "card":
      return generateCardCode(rules, card)
    case "voucher":
      return generateVoucherCode(rules, voucher)
    case "deck":
      return generateDeckCode(rules, deck)
  }
  return null
}

const generateJokerCode = (
  rules: Rule[],
  joker?: JokerData
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const value = condition.params.value as string || "0";

    return `${value}`;
  }

const generateConsumableCode = (
  rules: Rule[],
  consumable?: ConsumableData
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const value = condition.params.value as string || "0";

   return `${value}`;
}

const generateCardCode = (
  rules: Rule[],
  card?: EditionData | EnhancementData | SealData
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const value = condition.params.value as string || "0";

  return `${value}`;
}

const generateVoucherCode = (
  rules: Rule[],
  voucher?: VoucherData
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const value = condition.params.value as string || "0";

  return `${value}`;
}

const generateDeckCode = (
  rules: Rule[],
  deck?: DeckData
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const value = condition.params.value as string || "0";

  return `${value}`;
}