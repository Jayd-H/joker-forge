import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateConfigVariables } from "../gameVariableUtils";

export const generateEditRarityWeightEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const key_rarity = effect.params.key_rarity as string || "";

  const variableName =
    sameTypeCount === 0 ? "rarity_rate" : `rarity_rate${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    itemType
  );

  let RarityWeightCode = "";

  if (operation === "add") {
    RarityWeightCode += `
    G.GAME.${key_rarity}_mod = G.GAME.${key_rarity}_mod +${valueCode}
    `;
  } else if (operation === "subtract") {
        RarityWeightCode += `
        G.GAME.${key_rarity}_mod = G.GAME.${key_rarity}_mod -${valueCode}
        `;
  } else if (operation === "set") {
        RarityWeightCode += `
        G.GAME.${key_rarity}_mod = ${valueCode}
        `;
  } else if (operation === "multiply") {
        RarityWeightCode += `
        G.GAME.${key_rarity}_mod = G.GAME.${key_rarity}_mod *${valueCode}
        `;
  } else if (operation === "divide") {
        RarityWeightCode += `
        G.GAME.${key_rarity}_mod = G.GAME.${key_rarity}_mod /${valueCode}
        `;
  }

  if (itemType === "voucher") {
    return {
      statement: `
        G.E_MANAGER:add_event(Event({
          func = function()
            ${RarityWeightCode}               
            return true
          end
        }))`,
      colour: "G.C.BLUE",
      configVariables,
    }
  } else {
    return {
      statement: RarityWeightCode,
      colour: "G.C.BLUE",
      configVariables,
    }
  }
}
