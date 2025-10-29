import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateEditCardAppearanceEffectCode = (
  effect: Effect,
): EffectReturn => {
  const card_appearance = effect.params?.card_appearance || "appear";
  const key = effect.params.key as string || "";

  let editAppearCode = "";

  if (card_appearance !== "none") {
    if (card_appearance === "appear") {
        editAppearCode += `
        G.P_CENTERS["${key}"].in_pool = function() return true end
        `;
    } else if (card_appearance === "disappear") {
        editAppearCode += `
        G.P_CENTERS["${key}"].in_pool = function() return false end
        `;
    }
  }

  return {
    statement: editAppearCode,
    colour: "G.C.MONEY",
  };
}