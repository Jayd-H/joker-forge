import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";
import { generateValueCode } from "../lib/gameVariableUtils";

export const generateEditRerollPriceEffectCode = (
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


  let RelorrsCode = "";

    if (operation === "add") {
        RelorrsCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
                G.GAME.round_resets.reroll_cost = G.GAME.round_resets.reroll_cost + ${valueCode}
                G.GAME.current_round.reroll_cost = math.max(0,
                G.GAME.current_round.reroll_cost + ${valueCode})
                return true
            end
        }))
        `;
  } else if (operation === "subtract") {
        RelorrsCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
                G.GAME.round_resets.reroll_cost = G.GAME.round_resets.reroll_cost - ${valueCode}
                G.GAME.current_round.reroll_cost = math.max(0,
                G.GAME.current_round.reroll_cost - ${valueCode})
                return true
            end
        }))
        `;
  }

  return {
    statement: RelorrsCode,
    colour: "G.C.BLUE",
  };
};
