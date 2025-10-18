import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateEditEndRoundHandMoneyReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value;

  const valueCode = generateGameVariableCode(value);

  let HandMoneyCode = "";

    if (operation === "add") {
        HandMoneyCode += `
        G.GAME.modifiers.money_per_hand =  (G.GAME.modifiers.money_per_hand or 1) +${valueCode}
        `;
  } else if (operation === "subtract") {
        HandMoneyCode += `
        G.GAME.modifiers.money_per_hand =  (G.GAME.modifiers.money_per_hand or 1) -${valueCode}
        `;
  } else if (operation === "set") {
        HandMoneyCode += `
          G.GAME.modifiers.money_per_hand = ${valueCode}
        `;
  }

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`hand_dollars_value = ${value}`];

  return {
    statement: HandMoneyCode,
    colour: "G.C.MONEY",
    configVariables,
  };
};
