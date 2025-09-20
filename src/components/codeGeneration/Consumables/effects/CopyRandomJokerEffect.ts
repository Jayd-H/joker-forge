import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateCopyRandomJokerReturn = (effect: Effect): EffectReturn => {
  const amount = effect.params?.amount || 1;
  const edition = effect.params?.edition || "none";
  const customMessage = effect.customMessage;

  let copyJokerCode = `
            __PRE_RETURN_CODE__
            local jokers_to_copy = {}
            local available_jokers = {}
            
            for _, joker in pairs(G.jokers.cards) do
                if joker.ability.set == 'Joker' then
                    available_jokers[#available_jokers + 1] = joker
                end
            end
            
            if #available_jokers > 0 then
                local temp_jokers = {}
                for _, joker in ipairs(available_jokers) do 
                    temp_jokers[#temp_jokers + 1] = joker 
                end
                
                pseudoshuffle(temp_jokers, 54321)
                
                for i = 1, math.min(card.ability.extra.copy_amount, #temp_jokers, G.jokers.config.card_limit - #G.jokers.cards) do
                    jokers_to_copy[#jokers_to_copy + 1] = temp_jokers[i]
                end
            end

            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    play_sound('timpani')
                    used_card:juice_up(0.3, 0.5)
                    return true
                end
            }))

            local _first_materialize = nil
            for _, joker_to_copy in pairs(jokers_to_copy) do
                G.E_MANAGER:add_event(Event({
                    trigger = 'before',
                    delay = 0.4,
                    func = function()
                        local copied_joker = copy_card(joker_to_copy, nil, nil, nil, false)
                        copied_joker:start_materialize(nil, _first_materialize)
                        copied_joker:add_to_deck()
                        G.jokers:emplace(copied_joker)
                        _first_materialize = true`;

  // Handle edition application
  if (edition === "remove") {
    copyJokerCode += `
                        copied_joker:set_edition(nil, true)`;
  } else if (edition === "random") {
    copyJokerCode += `
                        local edition = poll_edition('copy_joker_edition', nil, true, true, 
                            { 'e_polychrome', 'e_holo', 'e_foil' })
                        copied_joker:set_edition(edition, true)`;
  } else if (edition !== "none") {
    const editionMap: Record<string, string> = {
      e_foil: "foil",
      e_holo: "holo",
      e_polychrome: "polychrome",
      e_negative: "negative",
    };
    const editionLua = editionMap[edition as keyof typeof editionMap] || "foil";
    copyJokerCode += `
                        copied_joker:set_edition({ ${editionLua} = true }, true)`;
  }

  copyJokerCode += `
                        return true
                    end
                }))
            end
            delay(0.6)
            __PRE_RETURN_CODE_END__`;

  const result: EffectReturn = {
    statement: copyJokerCode,
    colour: "G.C.SECONDARY_SET.Spectral",
    configVariables: [`copy_amount = ${amount}`],
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
