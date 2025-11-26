import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";
import { generateValueCode } from "../lib/gameVariableUtils";

export const generateEditInterestCapEffectCode = (
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
  itemType: string
): EffectReturn => {
  const operation = (effect.params?.operation?.value as string) || "add";
  const valueCode = generateValueCode(effect.params?.value, itemType)

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
  };
};