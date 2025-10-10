import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";

export const generateRedeemVoucherReturn = (
  effect: Effect
): EffectReturn => {
  const voucherKey = effect.params?.specific_voucher as string || "";

const configVariables =
    typeof voucherKey === "string" && voucherKey.startsWith("GAMEVAR:")
      ? []
      : [`vouchers = { ${voucherKey}, }`];

  return {
    statement: `-- Start With ${voucherKey}`,
    colour: "G.C.RED",
    configVariables,
  };
};
