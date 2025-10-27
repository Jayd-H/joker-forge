import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateRedeemVoucherEffectCode = (
  effect: Effect,
): EffectReturn => {
  const voucherType = (effect.params?.voucher_type as string) || "random";
  const voucherKey = (effect.params?.specific_voucher as string) || "v_overstock_norm";
  const customMessage = effect.customMessage;

  let voucherCode: string;

  if (voucherType === "random") {
    voucherCode = `local voucher_key = pseudorandom_element(G.P_CENTER_POOLS.Voucher, "${effect.id.substring(0,8)}").key`;
  } else {
    voucherCode = `local voucher_key = "${voucherKey}"`;
  }

  voucherCode += `
    local voucher_card = SMODS.create_card{area = G.play, key = voucher_key}
    voucher_card:start_materialize()
    voucher_card.cost = 0
    G.play:emplace(voucher_card)
    delay(0.8)
    voucher_card:redeem()

    G.E_MANAGER:add_event(Event({
        trigger = 'after',
        delay = 0.5,
        func = function()
            voucher_card:start_dissolve()                
            return true
        end
    }))`;

  return {
    statement: `__PRE_RETURN_CODE__${voucherCode}
              __PRE_RETURN_CODE_END__`,
    message: customMessage
      ? `"${customMessage}"`
      : `nil`,
    colour: "G.C.RED",
  };
};