import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../../lib/effectUtils";
import { generateConfigVariables } from "../../lib/gameVariableUtils";

export const generateRemoveStartingCardsEffectCode = (
  effect: Effect,
  sameTypeCount: number = 0,
): EffectReturn => {
  const remove_type = effect.params?.remove_type?.value || "all";

  const variableName = (
    sameTypeCount !== 1 ? `add_starting_cards_count${sameTypeCount}` : `add_starting_cards_count`)

  const { valueCode, configVariables } = generateConfigVariables(
    effect, 
    'count',
    variableName,
    'deck'
  )

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
            for i = 1, ${valueCode} do destroyed_cards[#destroyed_cards + 1] = temp_hand[i]:remove()
         end
         G.GAME.starting_deck_size = #G.playing_cards
        return true
    end
}))
       `; 
  }

  const result: EffectReturn = {
    statement: `__PRE_RETURN_CODE__${destroyCode}__PRE_RETURN_CODE_END__`,
    colour: "G.C.RED",
    configVariables,
  };

  return result;
}