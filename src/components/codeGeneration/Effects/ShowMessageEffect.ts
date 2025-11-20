import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";

export const generateShowMessageEffectCode = (
  effect: Effect,
): EffectReturn => {
  const colour = (effect.params?.colour.value as string) || "G.C.WHITE";
  const customMessage = effect.customMessage as string;
  const type = effect.params?.message_type.value as string
  const textVar = effect.params?.text_var.value as string

  const messageCode = customMessage ? `"${customMessage}"` : '"Message!"';

  if (type === 'text') {
    return {
      statement: "",
      message: messageCode,
      colour: colour,
    };
  } else {
    return {
      statement: "",
      message: `card.ability.extra.${textVar}`,
      colour: colour,
    };
  }
}