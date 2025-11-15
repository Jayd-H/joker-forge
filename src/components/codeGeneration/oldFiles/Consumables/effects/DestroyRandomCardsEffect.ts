import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateDestroyRandomCardsReturn = (
  effect: Effect
): EffectReturn => {
  const count = effect.params?.count || 1;
  const customMessage = effect.customMessage;

  const countCode = generateGameVariableCode(count);

  const destroyCode = `
            local destroyed_cards = {}
            local temp_hand = {}

            for _, playing_card in ipairs(G.hand.cards) do temp_hand[#temp_hand + 1] = playing_card end
            table.sort(temp_hand,
                function(a, b)
                    return not a.playing_card or not b.playing_card or a.playing_card < b.playing_card
                end
            )

            pseudoshuffle(temp_hand, 12345)

            for i = 1, ${countCode} do destroyed_cards[#destroyed_cards + 1] = temp_hand[i] end

            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    play_sound('tarot1')
                    card:juice_up(0.3, 0.5)
                    return true
                end
            }))
            SMODS.destroy_cards(destroyed_cards)

            delay(0.5)`;

  const configVariables =
    typeof count === "string" && count.startsWith("GAMEVAR:")
      ? []
      : [`destroy_count = ${count}`];

  const result: EffectReturn = {
    statement: destroyCode,
    colour: "G.C.RED",
    configVariables,
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
