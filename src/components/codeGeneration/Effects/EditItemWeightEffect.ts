import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateConfigVariables } from "../gameVariableUtils";

export const generateEditItemWeightEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = effect.params?.operation as string|| "add";
  const key = effect.params?.key as string || "";

  const variableName =
    sameTypeCount === 0 ? "item_rate" : `item${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    itemType
  );

  let ItemWeightCode = "";

  if (operation === "add") {
    ItemWeightCode += `
    G.GAME.${key}_rate = G.GAME.${key}_rate +${valueCode}
    `;
  } else if (operation === "subtract") {
        ItemWeightCode += `
        G.GAME.${key}_rate = G.GAME.${key}_rate -${valueCode}
        `;
  } else if (operation === "set") {
        ItemWeightCode += `
        G.GAME.${key}_rate = ${valueCode}
        `;
  } else if (operation === "multiply") {
        ItemWeightCode += `
        G.GAME.${key}_rate = G.GAME.${key}_rate *${valueCode}
        `;
  } else if (operation === "divide") {
        ItemWeightCode += `
        G.GAME.${key}_rate = G.GAME.${key}_rate /${valueCode}
        `;
  }

  if (itemType === "voucher") {
    return {
      statement: `
        G.E_MANAGER:add_event(Event({
          func = function()
            ${ItemWeightCode}               
            return true
          end
        }))`,
      colour: "G.C.BLUE",
      configVariables,
    }
  } else {
    return {
      statement: ItemWeightCode,
      colour: "G.C.BLUE",
      configVariables,
    }
  }
}
