import { EDITIONS } from "../../../data/BalatroUtils";
import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateEditionRandomJokerReturn = (
  effect: Effect
): EffectReturn => {
  const amount = effect.params?.amount
  const edition = effect.params?.edition as string || "e_foil";
  const targetType = effect.params?.target_type as string || "editionless";
  const customMessage = effect.customMessage as string

  let editionJokerCode = `
            __PRE_RETURN_CODE__
            local jokers_to_edition = {}
            local eligible_jokers = {}
            
            if '${targetType}' == 'editionless' then
                eligible_jokers = SMODS.Edition:get_edition_cards(G.jokers, true)
            else
                for _, joker in pairs(G.jokers.cards) do
                    if joker.ability.set == 'Joker' then
                        eligible_jokers[#eligible_jokers + 1] = joker
                    end
                end
            end
            
            if #eligible_jokers > 0 then
                local temp_jokers = {}
                for _, joker in ipairs(eligible_jokers) do 
                    temp_jokers[#temp_jokers + 1] = joker 
                end
                
                pseudoshuffle(temp_jokers, 76543)
                
                for i = 1, math.min(card.ability.extra.edition_amount, #temp_jokers) do
                    jokers_to_edition[#jokers_to_edition + 1] = temp_jokers[i]
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

            for _, joker in pairs(jokers_to_edition) do
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.2,
                    func = function()`;

  // Handle different edition types
  if (edition === "random") {
    editionJokerCode += `
                        local edition = poll_edition('edition_random_joker', nil, true, true, 
                            { 'e_polychrome', 'e_holo', 'e_foil' })
                        joker:set_edition(edition, true)`;
  } else if (edition === "remove") {
    editionJokerCode += `
                        joker:set_edition(nil, true)`;
  } else {
    const editions: {key: string, value: string}[] = []
    EDITIONS().forEach(edition => {
      editions.push({key: edition.key, value: edition.value})
    })

    const editionLua = editions[editions.map(edition => edition.key).indexOf(edition)].value || "foil";
    editionJokerCode += `
                        joker:set_edition({ ${editionLua} = true }, true)`;
  }

  editionJokerCode += `
                        return true
                    end
                }))
            end
            delay(0.6)
            __PRE_RETURN_CODE_END__`;

  const result: EffectReturn = {
    statement: editionJokerCode,
    colour: "G.C.SECONDARY_SET.Spectral",
    configVariables: [`edition_amount = ${amount}`],
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
