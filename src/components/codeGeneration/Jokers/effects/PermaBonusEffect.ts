import type { Effect } from "../../../ruleBuilder/types";
import {
  generateGameVariableCode,
  parseGameVariable,
  parseRangeVariable,
} from "../gameVariableUtils";
import type { EffectReturn, ConfigExtraVariable } from "../effectUtils";

export const generatePermaBonusReturn = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const effectValue = effect.params.value;
  const bonusType = effect.params.bonus_type as string;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let valueCode: string;
  const configVariables: ConfigExtraVariable[] = [];

  const variableName =
    sameTypeCount === 0 ? "perma_bonus" : `perma_bonus${sameTypeCount + 1}`;

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(effectValue);
  } else if (rangeParsed.isRangeVariable) {
    const seedName = `${variableName}_${effect.id.substring(0, 8)}`;
    valueCode = `pseudorandom('${seedName}', card.ability.extra.${variableName}_min, card.ability.extra.${variableName}_max)`;

    configVariables.push(
      { name: `${variableName}_min`, value: rangeParsed.min || 1 },
      { name: `${variableName}_max`, value: rangeParsed.max || 5 }
    );
  } else if (typeof effectValue === "string") {
    if (effectValue.endsWith("_value")) {
      valueCode = effectValue;
    } else {
      valueCode = `card.ability.extra.${effectValue}`;
    }
  } else {
    valueCode = `card.ability.extra.${variableName}`;

    configVariables.push({
      name: variableName,
      value: Number(effectValue) || 1,
    });
  }

  const customMessage = effect.customMessage;

  const preReturnCode = `context.other_card.ability.${bonusType} = context.other_card.ability.${bonusType} or 0
                context.other_card.ability.${bonusType} = context.other_card.ability.${bonusType} + ${valueCode}`;

  const result: EffectReturn = {
    statement: `__PRE_RETURN_CODE__${preReturnCode}__PRE_RETURN_CODE_END__extra = { message = localize('k_upgrade_ex'), colour = G.C.CHIPS }, card = card`,
    colour: "G.C.CHIPS",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
