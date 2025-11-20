import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";
import { generateConfigVariables } from "../lib/gameVariableUtils";

export const generateEditRerollPriceEffectCode = (
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
    sameTypeCount === 0 ? "reroll_price_value" : `reroll_price_value${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
    variableName,
    'voucher'
  );


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
    configVariables,
  };
};
