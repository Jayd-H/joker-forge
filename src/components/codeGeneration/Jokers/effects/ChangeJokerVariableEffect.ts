import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateChangeJokerVariableReturn = (
  effect: Effect
): EffectReturn => {
  const variableName = (effect.params.variable_name as string) || "jokervar";
  const changeType = (effect.params.change_type as string) || "random";
  const specificJoker = (effect.params.specific_joker as string) || "j_joker";
  const randomType = (effect.params.random_type as string) || "all";
  const rarity = (effect.params.rarity as string) || "1";
  const pool = (effect.params.pool as string) || "";
  

  let statement = `__PRE_RETURN_CODE__`
  let valueCode = "j_joker"

  if (changeType === "evaled_joker") {
    valueCode = "context.other_joker.config.center.key"
  } else if (changeType === "selected_joker") {
    valueCode = "G.jokers.highlighted[1]"
  } else if (changeType === "specific") {
    valueCode = specificJoker
  } else if (changeType === "random") {

    valueCode = "random_joker_result"
    statement +=  `local possible_jokers = {}`

    if (randomType === "unlocked") {
      statement += `
      for i = 1, #G.P_CENTERS do
        if G.P_CENTERS[i].config.center.unlocked == true then
          possible_jokers[#possible_jokers + 1] = G.P_CENTERS[i].config.center.key
        end
      end`
    } else if (randomType === "locked") {
      statement += `
        for i = 1, #G.P_LOCKED do
                if string.sub(G.P_LOCKED[i].key, 1, 1) == 'j' then 
                    if possible_jokers[1] == 'j_joker' then
                        possible_jokers[1] = G.P_LOCKED[i].key
                    else
                        possible_jokers[#possible_jokers + 1] = G.P_LOCKED[i].key
                    end
                end
            end
            local random_joker_result = pseudorandom_element(possible_jokers, 'random joker')`
    } else if (randomType === "pool") {
      statement += `
        for i = 1, #G.P_CENTERS do
          for j = 1, #G.P_CENTERS[i].pools
            if G.P_CENTERS[i].pools[j] == ${pool} then
              possible_jokers[#possible_jokers + 1] = G.P_CENTERS[i].config.center.key
            end
          end
        end`
    } else if (randomType === "owned") {
      statement += `
        for i = 1, #G.jokers.cards do
          possible_jokers[#possible_jokers + 1] = G.jokers.cards[i].config.center.key
        end`
    } else if (randomType === "rarity") {
      statement += `
        for i = 1, #G.P_CENTERS do
          if G.P_CENTERS[i].config.center.rarity == ${rarity} then
            possible_jokers[#possible_jokers + 1] = G.P_CENTERS[i].config.center.key
          end
        end`
    } else {
      statement += `
        for i = 1, #G.P_CENTERS do
          possible_jokers[#possible_jokers + 1] = G.P_CENTERS[i].config.center.key
        end`
    }

    statement += `
      local random_joker_result = pseudorandom_element(possible_jokers, 'random joker')`

  } else {
    valueCode = changeType
  }

  statement += `
                card.ability.extra.${variableName} = ${valueCode}
                __PRE_RETURN_CODE_END__`;   


  const result: EffectReturn = {
    statement,
    colour: "G.C.FILTER",
  };

  if (effect.customMessage) {
    result.message = `"${effect.customMessage}"`;
  }

  return result;
};
