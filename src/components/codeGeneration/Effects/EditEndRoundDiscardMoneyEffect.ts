import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";
import { generateValueCode } from "../lib/gameVariableUtils";

export const generateEditDiscardsMoneyEffectCode = (
  effect: Effect,
  itemType: string,
): EffectReturn => {
  switch(itemType) {
    case "voucher":
    case "deck":
      return generateVoucherAndDeckCode(effect, itemType)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateVoucherAndDeckCode = (
  effect: Effect,
  itemType: string,
): EffectReturn => {
  const operation = (effect.params?.operation?.value as string) || "add";
  const valueCode = generateValueCode(effect.params?.value, itemType)

  let DiscardMoneyCode = "";

    if (operation === "set") {
        DiscardMoneyCode += `
           G.GAME.modifiers.money_per_discard = ${valueCode}
        `;
  }

  return {
    statement: `__PRE_RETURN_CODE__${DiscardMoneyCode}__PRE_RETURN_CODE_END__`,
    colour: "G.C.MONEY",
  };
};
