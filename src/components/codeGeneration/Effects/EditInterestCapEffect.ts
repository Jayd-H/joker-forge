import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";
import { generateConfigVariables } from "../lib/gameVariableUtils";

export const generateEditInterestCapEffectCode = (
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
  sameTypeCount: number = 0,
): EffectReturn => {
  const operation = effect.params?.operation.value || "add";
  const variableName =
    sameTypeCount === 0 ? "interest_cap_value" : `interest_cap_value${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
    variableName,
    'voucher'
  );


  let CapSizeCode = "";

    if (operation === "add") {
        CapSizeCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.interest_cap = G.GAME.interest_cap +${valueCode}
                return true
            end
        }))
        `;
  } else if (operation === "subtract") {
        CapSizeCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.interest_cap = G.GAME.interest_cap -${valueCode}
                return true
            end
        }))
        `;
  } else if (operation === "set") {
        CapSizeCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
    G.GAME.interest_cap = ${valueCode}
                return true
            end
        }))
        `;
  } else if (operation === "multiply") {
        CapSizeCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.interest_cap = G.GAME.interest_cap *${valueCode}
                return true
            end
        }))
        `;
  } else if (operation === "divide") {
        CapSizeCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.interest_cap = G.GAME.interest_cap /${valueCode}
                return true
            end
        }))
        `;
  }

  return {
    statement: CapSizeCode,
    colour: "G.C.BLUE",
    configVariables,
  };
};