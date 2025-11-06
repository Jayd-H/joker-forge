import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../Libs/effectUtils";
import { generateConfigVariables } from "../Libs/gameVariableUtils";

export const generateEditItemWeightEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0,
  type: string
): EffectReturn => {
  const operation = effect.params?.operation as string || "add";
  const key = effect.params?.key as string || "";

  const variableName =
    sameTypeCount === 0 ? "item_rate" : `item${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    itemType
  );

  const itemCode = type === "rarity_weight" ? `G.GAME.${key}_mod` : `G.GAME.${key}_rate`

  let ItemWeightCode = "";

  if (operation === "add") {
    ItemWeightCode = `${itemCode} = ${itemCode} + ${valueCode}`;
  } else if (operation === "subtract") {
    ItemWeightCode = `${itemCode} = ${itemCode} -${valueCode}`;
  } else if (operation === "set") {
    ItemWeightCode = `${itemCode} = ${valueCode}`;
  } else if (operation === "multiply") {
    ItemWeightCode = `${itemCode} = ${itemCode} * ${valueCode}`;
  } else if (operation === "divide") {
    ItemWeightCode = `${itemCode} = ${itemCode} / ${valueCode}`;
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
