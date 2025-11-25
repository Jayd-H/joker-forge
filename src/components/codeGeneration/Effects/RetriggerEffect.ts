import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";
import type { EditionData, EnhancementData, SealData } from "../../data/BalatroUtils";
import { generateConfigVariables } from "../lib/gameVariableUtils";

export const generateRetriggerEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0,
  card?: EditionData | EnhancementData | SealData
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect, sameTypeCount)
    case "card":
      return generateCardCode(effect, sameTypeCount, card)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateJokerCode = (
  effect: Effect,
  sameTypeCount: number = 0,
): EffectReturn => {
  const variableName =
    sameTypeCount === 0 ? "repetitions" : `repetitions${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'repetitions',
    variableName,
    'joker'
  )

  const customMessage = effect.customMessage;
  const messageCode = customMessage
    ? `"${customMessage}"`
    : "localize('k_again_ex')";

  return {
    statement: `repetitions = ${valueCode}`,
    message: messageCode,
    colour: "G.C.RED",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };
};

const generateCardCode = (
  effect: Effect,
  sameTypeCount: number = 0,
  card?: EditionData | EnhancementData | SealData
): EffectReturn => {
  const effectValue = effect.params?.value.value ?? 1;
  const variableName =
    sameTypeCount === 0
      ? "retrigger_times"
      : `retrigger_times${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
    variableName,
    card?.objectType ?? 'enhancement'
  );

  const abilityPath =
    card?.objectType === "seal" ? "card.ability.seal.extra" : "card.ability.extra";
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
    configVariables
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
}