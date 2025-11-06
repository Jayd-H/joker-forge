import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../Libs/effectUtils";
import { generateConfigVariables } from "../Libs/gameVariableUtils";

export const generateDestroyCardsEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0
): EffectReturn => {
  switch(itemType) {
    case "consumable":
      return generateConsumableCode(effect, sameTypeCount)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateConsumableCode = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const customMessage = effect.customMessage;
  const selectionMethod = effect.params?.method as string || "random"

  switch (selectionMethod) {
    case "selected":
      return  {
        statement: `
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
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.2,
                    func = function()
                        SMODS.destroy_cards(G.hand.highlighted)
                        return true
                    end
                }))
                delay(0.3)
                __PRE_RETURN_CODE_END__`,
        colour: "G.C.RED",
        message: customMessage ?? undefined
      }

  case "random":  
  default:
      const variableName =
        sameTypeCount === 0 ? "destroy_count" : `destroy_count${sameTypeCount + 1}`;

      const { valueCode, configVariables } = generateConfigVariables(
        effect.params?.count ?? 1,
        effect.id,
        variableName,
        'consumable',
      )    
      
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
    
                for i = 1, ${valueCode} do destroyed_cards[#destroyed_cards + 1] = temp_hand[i] end
    
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
}