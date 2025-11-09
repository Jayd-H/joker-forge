import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateAddDollarsFromJokersReturn = (
  effect: Effect
): EffectReturn => {
  const limit = effect.params?.limit || 50;
  const customMessage = effect.customMessage;

  const limitCode = generateGameVariableCode(limit);

  const jokerDollarsCode = `
            __PRE_RETURN_CODE__
            local money = 0
            for i = 1, #G.jokers.cards do
                if G.jokers.cards[i].ability.set == 'Joker' then
                    money = money + G.jokers.cards[i].sell_cost
                end
            end
            card.ability.extra.joker_money = math.min(money, ${limitCode})

            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    play_sound('timpani')
                    used_card:juice_up(0.3, 0.5)
                    ease_dollars(card.ability.extra.joker_money, true)
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;

  const configVariables =
    typeof limit === "string" && limit.startsWith("GAMEVAR:")
      ? [`joker_money = 0`]
      : [`joker_limit = ${limit}`, `joker_money = 0`];

  const result: EffectReturn = {
    statement: jokerDollarsCode,
    colour: "G.C.MONEY",
    configVariables,
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
