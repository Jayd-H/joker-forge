import type { Rule } from "../../../ruleBuilder/types";

export const generateVoucherRedeemedConditionCode = (rules: Rule[]): string => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "voucher_redeemed") return "";

  const voucher = (condition.params?.voucher as string) || "v_overstock_norm";

  return `G.GAME.used_vouchers["${voucher}"]`;
};
