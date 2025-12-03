import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";

export const generateAddVoucherToShopEffectCode = (
  effect: Effect,
  itemType: string,
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateJokerCode = (
  effect: Effect,
): EffectReturn => {
  const method = effect.params.method_type as string || "specific";
  const specificVoucher = effect.params.specific_key as string || "v_overstock_norm";
  const voucherVariable = effect.params.key_variable as string || "";
  const duration = effect.params?.duration || "false";

  let voucherCode = ''
  if (method === "key_var") {
    voucherCode = `SMODS.add_voucher_to_shop(card.ability.extra.${voucherVariable},${duration})`
  } else if (method === "random") {
    voucherCode = `SMODS.add_voucher_to_shop(nil,${duration})`
  } else {
    voucherCode = `SMODS.add_voucher_to_shop('${specificVoucher}',${duration})`
  }
  return {
    colour: "G.C.BLUE",
    statement: `__PRE_RETURN_CODE__
        ${voucherCode}
        __PRE_RETURN_CODE_END__`
  }
}