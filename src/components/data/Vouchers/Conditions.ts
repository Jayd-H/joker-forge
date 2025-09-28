import { ConditionTypeDefinition } from "../../ruleBuilder/types";
import { CategoryDefinition } from "../Jokers/Triggers";

export const VOUCHER_GENERIC_TRIGGERS: string[] = [
  "voucher_used",
];

export const VOUCHER_CONDITION_CATEGORIES: CategoryDefinition[] = [
];

export const VOUCHER_CONDITION_TYPES: ConditionTypeDefinition[] = [
];

export function getVoucherConditionsForTrigger(
  triggerId: string
): ConditionTypeDefinition[] {
  return VOUCHER_CONDITION_TYPES.filter((condition) =>
    condition.applicableTriggers?.includes(triggerId)
  );
}

export function getVoucherConditionTypeById(
  id: string
): ConditionTypeDefinition | undefined {
  return VOUCHER_CONDITION_TYPES.find((condition) => condition.id === id);
}
