import type { Effect } from "../../../ruleBuilder/types";
import {
  generateConfigVariables
} from "../gameVariableUtils";
import type { EffectReturn } from "../effectUtils";

export const generatePermaBonusReturn = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const bonusType = effect.params.bonus_type as string;

  const uniqueId = effect.id.substring(0, 8);
  const variableName = `pb_${bonusType.replace("perma_", "")}_${uniqueId}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName
  )

  const customMessage = effect.customMessage;

  const preReturnCode = `context.other_card.ability.${bonusType} = context.other_card.ability.${bonusType} or 0
                context.other_card.ability.${bonusType} = context.other_card.ability.${bonusType} + ${valueCode}`;

  let color = "G.C.CHIPS";
  if (bonusType.includes("mult")) {
    color = "G.C.MULT";
  } else if (bonusType.includes("dollars")) {
    color = "G.C.MONEY";
  }

  let statement = "";

  if (sameTypeCount === 0) {
    const messageText = customMessage
      ? `"${customMessage}"`
      : "localize('k_upgrade_ex')";
    statement = `__PRE_RETURN_CODE__${preReturnCode}__PRE_RETURN_CODE_END__extra = { message = ${messageText}, colour = ${color} }, card = card`;
  } else {
    statement = `__PRE_RETURN_CODE__${preReturnCode}__PRE_RETURN_CODE_END__`;
  }

  const result: EffectReturn = {
    statement,
    colour: color,
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };

  return result;
};
