import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditDollarsReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value;

  const valueCode = generateGameVariableCode(value);

  let dollarsCode = "";

    if (operation === "add") {
        dollarsCode += `
        ease_dollars(${valueCode})
        `;
  } else if (operation === "subtract") {
        dollarsCode += `
        ease_dollars(-${valueCode})
        `;
  } else if (operation === "set") {
        dollarsCode += `
          local current_dollars = G.GAME.dollars
                    local target_dollars = ${valueCode}
                    local difference = target_dollars - current_dollars
                    ease_dollars(difference)
        `;
  }

  return {
    statement: `__PRE_RETURN_CODE__
                   ${dollarsCode}
                    __PRE_RETURN_CODE_END__`,
    colour: "G.C.MONEY"
  };
};
