import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../../Libs/effectUtils";
import { generateGameVariableCode } from "../../Libs/gameVariableUtils";

export const generateEditStartingDollarsEffectCode = (
  effect: Effect,
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value;

  const valueCode = generateGameVariableCode(value, "deck");

  let dollarsCode = "";

    if (operation === "add") {
        dollarsCode += `
        G.GAME.starting_params.dollars = G.GAME.starting_params.dollars +${valueCode}
        `;
  } else if (operation === "subtract") {
        dollarsCode += `
        G.GAME.starting_params.dollars = G.GAME.starting_params.dollars -${valueCode}
        `;
  } else if (operation === "set") {
        dollarsCode += `
          G.GAME.starting_params.dollars = ${valueCode}
        `;
  }

  return {
    statement: `__PRE_RETURN_CODE__
                   ${dollarsCode}
                    __PRE_RETURN_CODE_END__`,
    colour: "G.C.MONEY"
  };
}