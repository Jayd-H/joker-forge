import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";

export const generateCreateCopyTriggeredCardEffectCode = (
  effect: Effect,
  itemType: string,
  triggerType: string,
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect, triggerType)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateJokerCode = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  const customMessage = effect.customMessage;
  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);
  const addTo = (effect.params?.add_to?.value as string) || "deck"

  let valueCode = `
      G.playing_card = (G.playing_card and G.playing_card + 1) or 1
      local copied_card = copy_card(context.other_card, nil, nil, G.playing_card)
      copied_card:add_to_deck()
      G.deck.config.card_limit = G.deck.config.card_limit + 1
      table.insert(G.playing_cards, copied_card)
      G.hand:emplace(copied_card)`

  if (addTo === "hand") {
    valueCode += `
      copied_card.states.visible = nil`
  } else if (addTo === "deck") {
    valueCode += `
      playing_card_joker_effects({true})`
  }

  valueCode += `
    G.E_MANAGER:add_event(Event({
        func = function() 
            copied_card:start_materialize()
            return true
        end
    }))` 
  
  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__${valueCode}
              __PRE_RETURN_CODE_END__`,
      message: customMessage
        ? `"${customMessage}"`
        : `"Copied Card to Hand!"`,
      colour: "G.C.GREEN",
    };
  } else {
    return {
      statement: `
      func = function()
      ${valueCode}
      G.E_MANAGER:add_event(Event({
        func = function()
            SMODS.calculate_context({ playing_card_added = true, cards = { copied_card } })
            return true
        end
    }))
  end`,
      message: customMessage
        ? `"${customMessage}"`
        : `"Copied Card to Hand!"`,
      colour: "G.C.GREEN",
    };
  }
}