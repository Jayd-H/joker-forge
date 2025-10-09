import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditEndRoundDiscardMoneyReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value;

  const valueCode = generateGameVariableCode(value);

  let DiscardMoneyCode = "";

    if (operation === "add") {
        DiscardMoneyCode += `
         G.GAME.modifiers.money_per_discard =  G.GAME.modifiers.money_per_discard + ${valueCode}
        `;
  } else if (operation === "subtract") {
        DiscardMoneyCode += `
         G.GAME.modifiers.money_per_discard =  G.GAME.modifiers.money_per_discard - ${valueCode}
        `;
  } else if (operation === "set") {
        DiscardMoneyCode += `
           G.GAME.modifiers.money_per_discard = ${valueCode}
        `;
  }

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`discard_dollars_value = ${value}`];

  return {
    statement: DiscardMoneyCode,
    colour: "G.C.MONEY",
    configVariables,
  };
};
