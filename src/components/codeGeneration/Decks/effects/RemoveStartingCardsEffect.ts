import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateRemoveStartingCardsReturn = (
  effect: Effect
): EffectReturn => {
  const count = effect.params?.count || 52;
  const remove_type = effect.params?.remove_type || "all";

  const countCode = generateGameVariableCode(count);

  let destroyCode = ""
  
  if (remove_type === "all") {
    destroyCode =`
            G.E_MANAGER:add_event(Event({
                func = function()
                for i=#G.deck.cards, 1, -1 do
                G.deck.cards[i]:remove()
            end
            return true
        end
    }))
            `;
  } else { 
    destroyCode =`
    local destroyed_cards = {}
            local temp_hand = {}
G.E_MANAGER:add_event(Event({
     func = function()
            for _, playing_card in ipairs(G.deck.cards) do temp_hand[#temp_hand + 1] = playing_card end
            table.sort(temp_hand,
                function(a, b)
                    return not a.playing_card or not b.playing_card or a.playing_card < b.playing_card
                end
            )
            pseudoshuffle(temp_hand, 12345)    
          return true
    end,
})) 
    
G.E_MANAGER:add_event(Event({
     func = function()
            for i = 1, ${countCode} do destroyed_cards[#destroyed_cards + 1] = temp_hand[i]:remove()
         end
        return true
    end
}))
       `; 
  }

  const configVariables =
    typeof count === "string" && count.startsWith("GAMEVAR:")
      ? []
      : [`destroy_count = ${count}`];

  const result: EffectReturn = {
    statement: destroyCode,
    colour: "G.C.RED",
    configVariables,
  };

  return result;
};
