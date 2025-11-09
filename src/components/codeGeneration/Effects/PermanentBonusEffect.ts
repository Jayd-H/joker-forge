import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";
import { generateConfigVariables } from "../lib/gameVariableUtils";

export const generatePermaBonusEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0,
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect, sameTypeCount)
    case "consumable":
      return generateConsumableCode(effect)

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
  const bonusType = effect.params.bonus_type as string;

  const uniqueId = effect.id.substring(0, 8);
  const variableName = `pb_${bonusType.replace("perma_", "")}_${uniqueId}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'joker'
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

const generateConsumableCode = (
  effect: Effect,
): EffectReturn => {
  const uniqueId = effect.id.substring(0, 8);
  const bonusType = effect.params?.bonus_type as string || "perma_bonus";
  const customMessage = effect.customMessage;

  const variableName = `pb_${bonusType.replace("perma_", "")}_${uniqueId}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'consumable'
  )
  const permaBonusCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    play_sound('tarot1')
                    used_card:juice_up(0.3, 0.5)
                    return true
                end
            }))
            for i = 1, #G.hand.highlighted do
                local percent = 1.15 - (i - 0.999) / (#G.hand.highlighted - 0.998) * 0.3
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.15,
                    func = function()
                        G.hand.highlighted[i]:flip()
                        play_sound('card1', percent)
                        G.hand.highlighted[i]:juice_up(0.3, 0.3)
                        return true
                    end
                }))
            end
            delay(0.2)
            for i = 1, #G.hand.highlighted do
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.1,
                    func = function()
                        G.hand.highlighted[i].ability.${bonusType} = G.hand.highlighted[i].ability.${bonusType} or 0
                        G.hand.highlighted[i].ability.${bonusType} = G.hand.highlighted[i].ability.${bonusType} + ${valueCode}
                        return true
                    end
                }))
            end
            for i = 1, #G.hand.highlighted do
                local percent = 0.85 + (i - 0.999) / (#G.hand.highlighted - 0.998) * 0.3
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.15,
                    func = function()
                        G.hand.highlighted[i]:flip()
                        play_sound('tarot2', percent, 0.6)
                        G.hand.highlighted[i]:juice_up(0.3, 0.3)
                        return true
                    end
                }))
            end
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.2,
                func = function()
                    G.hand:unhighlight_all()
                    return true
                end
            }))
            delay(0.5)
            __PRE_RETURN_CODE_END__`;

  const result: EffectReturn = {
    statement: permaBonusCode,
    colour: "G.C.CHIPS",
    configVariables,
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
}