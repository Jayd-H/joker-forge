import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";
import { generateConfigVariables } from "../lib/gameVariableUtils";

export const generateEditItemWeightEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0,
  type: string
): EffectReturn => {
  const operation = (effect.params?.operation?.value as string) || "add";
  const key = (effect.params?.key?.value as string) || "";
  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
    "item_rate",
    sameTypeCount,
    itemType,
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
      statement: `__PRE_RETURN_CODE__${ItemWeightCode}__PRE_RETURN_CODE_END__`,
      colour: "G.C.BLUE",
      configVariables,
    }
  }
}
