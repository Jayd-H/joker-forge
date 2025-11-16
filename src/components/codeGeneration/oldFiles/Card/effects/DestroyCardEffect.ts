import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateDestroyCardReturn = (
  effect: Effect,
  trigger?: string
): EffectReturn => {
  const customMessage = effect.customMessage;
  const setGlassTrigger = effect.params?.setGlassTrigger === "true";

  if (trigger === "card_discarded") {
    const result: EffectReturn = {
      statement: `remove = true`,
      colour: "G.C.RED",
      configVariables: undefined,
    };

    if (customMessage) {
      result.message = `"${customMessage}"`;
    }

    return result;
  }

  let statement: string;

  if (setGlassTrigger) {
    statement = `__PRE_RETURN_CODE__card.glass_trigger = true
            card.should_destroy = true__PRE_RETURN_CODE_END__`;
  } else {
    statement = `__PRE_RETURN_CODE__card.should_destroy = true__PRE_RETURN_CODE_END__`;
  }

  const result: EffectReturn = {
    statement: statement,
    colour: "G.C.RED",
    configVariables: undefined,
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
