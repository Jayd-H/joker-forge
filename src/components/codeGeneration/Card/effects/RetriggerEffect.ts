import type { Effect } from "../../../ruleBuilder/types";
import { generateConfigVariables } from "../../Jokers/gameVariableUtils";
import type { EffectReturn } from "../effectUtils";

export const generateRetriggerReturn = (
  effect: Effect,
  sameTypeCount: number = 0,
  itemType: "enhancement" | "seal" | "edition" = "enhancement"
): EffectReturn => {
  const effectValue = effect.params?.value ?? 1;
  const variableName =
    sameTypeCount === 0
      ? "retrigger_times"
      : `retrigger_times${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effectValue,
    effect.id,
    variableName,
    itemType
  );

  const abilityPath =
    itemType === "seal" ? "card.ability.seal.extra" : "card.ability.extra";
  const customMessage = effect.customMessage;

  let statement: string;

  if (typeof effectValue === "number" && effectValue !== 1) {
    statement = `__PRE_RETURN_CODE__card.should_retrigger = true
            ${abilityPath}.${variableName} = ${effectValue}__PRE_RETURN_CODE_END__`;
  } else if (valueCode !== `${abilityPath}.${variableName}`) {
    statement = `__PRE_RETURN_CODE__card.should_retrigger = true
            ${abilityPath}.${variableName} = ${valueCode}__PRE_RETURN_CODE_END__`;
  } else {
    statement = `__PRE_RETURN_CODE__card.should_retrigger = true__PRE_RETURN_CODE_END__`;
  }

  const result: EffectReturn = {
    statement: statement,
    colour: "G.C.SECONDARY_SET.Spectral",
    configVariables:
      configVariables.length > 0
        ? configVariables.map((cv) => `${cv.name} = ${cv.value}`)
        : undefined,
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
