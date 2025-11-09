import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";
import { generateConfigVariables } from "../lib/gameVariableUtils";

export const generateEditHandsMoneyEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0
): EffectReturn => {
  switch(itemType) {
    case "voucher":
    case "deck":
      return generateVoucherAndDeckCode(effect, sameTypeCount)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateVoucherAndDeckCode = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const variableName =
    sameTypeCount === 0 ? "hand_dollars_value" : `hand_dollars_value${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'voucher'
  );


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
    configVariables,
  };
};
