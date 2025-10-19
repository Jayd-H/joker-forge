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
          G.E_MANAGER:add_event(Event({
                func = function()
                for i=#G.deck.cards, ${countCode}, -1 do
                G.deck.cards[i]:remove()
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
