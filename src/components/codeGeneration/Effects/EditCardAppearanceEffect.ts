import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";

export const generateEditCardAppearanceEffectCode = (
  effect: Effect,
): EffectReturn => {
  const card_appearance = (effect.params?.card_appearance?.value as string) || "appear";
  const key = (effect.params.key?.value as string) || "";

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
    statement: `__PRE_RETURN_CODE__
      ${editAppearCode}
      __PRE_RETURN_CODE_END__`,
    colour: "G.C.MONEY",
  };
}