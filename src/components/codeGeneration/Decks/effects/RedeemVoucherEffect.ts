import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";

export const generateRedeemVoucherReturn = (
  effect: Effect
): EffectReturn => {
  const voucherKey = (effect.params?.specific_voucher as string) || "v_overstock_norm";

const configVariables =
    typeof voucherKey === "string" && voucherKey.startsWith("GAMEVAR:")
      ? []
      : [`vouchers = { "${voucherKey}" }`];

  return {
    statement: `-- Start With a Voucher`,
    colour: "G.C.RED",
    configVariables,
  };
};
