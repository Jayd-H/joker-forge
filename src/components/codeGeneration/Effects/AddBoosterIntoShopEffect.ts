import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";

export const generateAddBoosterToShopEffectCode = (
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
  const method = effect.params.method_type.value as string || "specific";
  const specificBooster = effect.params.specific_key.value as string || "p_arcana_normal_1";
  const boosterVariable = effect.params.key_variable.value as string || "";

  let boosterCode = ''
  if (method === "key_var") {
    boosterCode = `SMODS.add_booster_to_shop(card.ability.extra.${boosterVariable})`
  } else if (method === "random") {
    boosterCode = `SMODS.add_booster_to_shop()`
  } else {
    boosterCode = `SMODS.add_booster_to_shop('${specificBooster}')`
  }
  return {
    colour: "G.C.BLUE",
    statement: `__PRE_RETURN_CODE__
        ${boosterCode}
        __PRE_RETURN_CODE_END__`
  }
}