import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";
import { generateConfigVariables } from "../lib/gameVariableUtils";

export const generateEditDiscardsMoneyEffectCode = (
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
  const operation = effect.params?.operation.value || "add";
  const variableName =
    sameTypeCount === 0 ? "discard_dollars_value" : `discard_dollars_value${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
    variableName,
    'voucher'
  );


  let DiscardMoneyCode = "";

    if (operation === "set") {
        DiscardMoneyCode += `
           G.GAME.modifiers.money_per_discard = ${valueCode}
        `;
  }

  return {
    statement: `__PRE_RETURN_CODE__${DiscardMoneyCode}__PRE_RETURN_CODE_END__`,
    colour: "G.C.MONEY",
    configVariables,
  };
};
