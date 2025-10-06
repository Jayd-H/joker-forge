import type { Rule } from "../../../ruleBuilder/types";

export const generateVoucherRedeemedConditionCode = (
  rules: Rule[]
): string => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const voucher = (condition.params.voucher as string) || "v_overstock_norm";

  return `G.GAME.used_vouchers["${voucher}"]`
};
