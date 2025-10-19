import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateEditApperanceReturn = (effect: Effect): EffectReturn => {
  const card_apperance = effect.params?.card_apperance || "appear";
  const key = effect.params.key as string || "";

  let editappearCode = "";

if (card_apperance !== "none") {
    if (card_apperance === "appear") {
        editappearCode += `
        G.P_CENTERS["${key}"].in_pool = function() return true end
        `;
  } else if (card_apperance === "disapper") {
        editappearCode += `
        G.P_CENTERS["${key}"].in_pool = function() return false end
        `;
  }
}

  return {
    statement: editappearCode,
    colour: "G.C.MONEY",
  };
};
