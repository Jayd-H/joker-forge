import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";
import { generateValueCode } from "../lib/gameVariableUtils";

export const generateEditHandsMoneyEffectCode = (
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



  let HandMoneyCode = "";

    if (operation === "add") {
        HandMoneyCode += `
        G.GAME.modifiers.money_per_hand =  (G.GAME.modifiers.money_per_hand or 1) +${valueCode}
        `;
  } else if (operation === "subtract") {
        HandMoneyCode += `
        G.GAME.modifiers.money_per_hand =  (G.GAME.modifiers.money_per_hand or 1) -${valueCode}
        `;
  } else if (operation === "set") {
        HandMoneyCode += `
          G.GAME.modifiers.money_per_hand = ${valueCode}
        `;
  }

  return {
    statement: `__PRE_RETURN_CODE__${HandMoneyCode}__PRE_RETURN_CODE_END__`,
    colour: "G.C.MONEY",
  };
};
