import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../../effectUtils";

export const generateChangeKeyVariableEffectCode = (
  effect: Effect,
): EffectReturn => {
  const keyType = (effect.params.key_type as string) || "joker"

  const statement = generateKeyCode(effect, keyType)   

  const result: EffectReturn = {
    statement,
    colour: "G.C.FILTER",
  };

  if (effect.customMessage) {
    result.message = `"${effect.customMessage}"`;
  }

  return result;
}

const generateKeyCode = (
  effect: Effect, 
  keyType: string,
) => {
  switch(keyType){
    case "joker":
      return generateJokerKeyCode(effect)
    case "consumable":
      return generateConsumableKeyCode(effect)
    case "enhancement":
      return generateEnhancementKeyCode(effect)
    case "seal":
      return generateSealKeyCode(effect)
    case "edition":
      return generateEditionKeyCode(effect)
    case "booster":
      return generateBoosterKeyCode(effect)
    case "voucher":
      return generateVoucherKeyCode(effect)
    case "tag":
      return generateTagKeyCode(effect)
    default: 
      return ''
  }
}

const generateJokerKeyCode = (
  effect: Effect
) => {
  const variableName = (effect.params.variable_name as string) || "keyvar";
  const changeType = (effect.params.joker_change_type as string) || "random";
  const specificJoker = (effect.params.specific_joker as string) || "none";
  const randomType = (effect.params.joker_random_type as string) || "all";
  const rarity = (effect.params.rarity as string) || "1";
  const pool = (effect.params.pool as string) || "";
  
  let valueCode = 'j_joker'
  let statement = ''

  if (changeType === "evaled_joker") {
    valueCode = "context.other_joker.config.center.key"
  } else if (changeType === "selected_joker") {
    valueCode = "G.jokers.highlighted[1].config.center.key"
  } else if (changeType === "specific") {
    valueCode = `'${specificJoker}'`
  } else if (changeType === "random") {

    valueCode = "random_joker_result"
    statement +=  `local possible_jokers = {}`

    if (randomType === "unlocked") {
      statement += `
      for i = 1, #G.P_CENTERS do
        if G.P_CENTERS[i].config.center.unlocked == true && string.sub(G.P_CENTERS[i], 1, 1) == 'j' then
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
          for j = 1, #G.P_CENTERS[i].config.center.pools
            if G.P_CENTERS[i].config.center.pools[j] == ${pool} then
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
          if string.sub(G.P_CENTERS[i], 1, 1) == 'j' then
            possible_jokers[#possible_jokers + 1] = G.P_CENTERS[i].config.center.key
          end
        end`
    }

    statement += `
      local random_joker_result = pseudorandom_element(possible_jokers, 'random joker')`

  } else {
    valueCode = `card.ability.extra.${changeType}`
  }
  statement += `
                card.ability.extra.${variableName} = ${valueCode}
                __PRE_RETURN_CODE_END__`;

  return statement 
}

const generateConsumableKeyCode = (
  effect: Effect
) => {
  const variableName = (effect.params.variable_name as string) || "keyvar";
  const changeType = (effect.params.consumable_change_type as string) || "random";
  const specificConsumable = (effect.params.specific_consumable as string) || "none";
  const randomType = (effect.params.consumable_random_type as string) || "all";

  let statement = ''

  return statement
}

const generateEnhancementKeyCode = (
  effect: Effect
) => {
  const variableName = (effect.params.variable_name as string) || "keyvar";
  const changeType = (effect.params.enhancement_change_type as string) || "random";
  const specificEnhancement = (effect.params.specific_enhancement as string) || "none";
  const randomType = (effect.params.enhancement_random_type as string) || "all";

  let statement = ''
  let valueCode = ''

  if (changeType === "scored_card" || changeType === "discarded_card" || changeType === "held_card" || changeType === "added_card") {
    valueCode = `context.other_card.config.center.key`
  } else if (changeType === "destroyed_card") {
    valueCode = `context.removed_card.config.center.key`
  } else if (changeType === "added_card") {
    valueCode = `context.added_card.config.center.key`
  } else if (changeType === "random") {
    valueCode = "random_enhancement_result"
    statement += `local possible_enhancements = {}`

    if (randomType === "all") {
      statement += `
        for i = 1, #G.P_CENTERS do
          if string.sub(G.P_CENTERS[i], 1, 1) == 'm' or string.sub(G.P_CENTERS[i], 1, 1) == 'c' then
            possible_enhancements[#possible_enhancements + 1] = G.P_CENTERS[i].config.center.key
          end
        end`
    } 
    statement += `
      local random_enhancement_result = pseudorandom_element(possible_enhancements, 'random enhancement')`
  } else if (changeType === "specific") {
    valueCode = `'${specificEnhancement}'`
  } else {
    valueCode = `card.ability.extra.${changeType}`
  }

  statement += `
              card.ability.extra.${variableName} = ${valueCode}
              __PRE_RETURN_CODE_END__`;

  return statement
}

const generateSealKeyCode = (
  effect: Effect
) => {
  const variableName = (effect.params.variable_name as string) || "keyvar";
  const changeType = (effect.params.seal_change_type as string) || "random";
  const specificSeal = (effect.params.specific_seal as string) || "none";
  const randomType = (effect.params.seal_random_type as string) || "all";

  let statement = ''
  let valueCode = ''

  if (changeType === "scored_card" || changeType === "discarded_card" || changeType === "held_card" || changeType === "added_card") {
    valueCode = `context.other_card.seal`
  } else if (changeType === "destroyed_card") {
    valueCode = `context.removed_card.seal`
  } else if (changeType === "added_card") {
    valueCode = `context.added_card.seal`
  } else if (changeType === "random") {
    valueCode = "random_enhancement_result"
    statement += `local possible_enhancements = {}`

    if (randomType === "all") {
      statement += `
        for i = 1, #G.P_SEALS do
            possible_seals[#possible_seals + 1] = G.P_SEALS[i].config.center.key
        end`
    } 
    statement += `
      local random_enhancement_result = pseudorandom_element(possible_enhancements, 'random enhancement')`
  } else if (changeType === "specific") {
    valueCode = `'${specificSeal}'`
  } else {
    valueCode = `card.ability.extra.${changeType}`
  }

  statement += `
              card.ability.extra.${variableName} = ${valueCode}
              __PRE_RETURN_CODE_END__`;

  return statement
}

const generateEditionKeyCode = (
  effect: Effect
) => {
  const variableName = (effect.params.variable_name as string) || "keyvar";
  const changeType = (effect.params.edition_change_type as string) || "random";
  const specificEdition = (effect.params.specific_edition as string) || "none";
  const randomType = (effect.params.edition_random_type as string) || "all";

  let statement = ''
  let valueCode = ''

  if (changeType === "scored_card" || changeType === "discarded_card" || changeType === "held_card" || changeType === "added_card") {
    valueCode = `context.other_card.edition.key`
  } else if (changeType === "destroyed_card") {
    valueCode = `context.removed_card.edition.key`
  } else if (changeType === "added_card") {
    valueCode = `context.added_card.edition.key`
  } else if (changeType === "evaled_joker") {
    valueCode = "context.other_joker.edition.key"
  } else if (changeType === "selected_joker") {
    valueCode = "G.jokers.highlighted[1].edition.key"
  } else if (changeType === "random") {
    valueCode = "random_edition_result"
    statement += `local possible_editions = {}`

    if (randomType === "all") {
      statement += `
        for i = 1, #G.P_CENTERS do
          if string.sub(G.P_CENTERS[i], 1, 1) == 'e' then
            possible_editions[#possible_editions + 1] = G.P_CENTERS[i].config.center.key
          end        
        end`
    } 
    statement += `
      local random_edition_result = pseudorandom_element(possible_editions, 'random edition')`
  } else if (changeType === "specific") {
    valueCode = `'${specificEdition}'`
  } else {
    valueCode = `card.ability.extra.${changeType}`
  }

  statement += `
              card.ability.extra.${variableName} = ${valueCode}
              __PRE_RETURN_CODE_END__`;

  return statement
}


const generateVoucherKeyCode = (
  effect: Effect
) => {
  const variableName = (effect.params.variable_name as string) || "keyvar";
  const changeType = (effect.params.voucher_change_type as string) || "random";
  const specificVoucher = (effect.params.specific_voucher as string) || "none";
  const randomType = (effect.params.voucher_random_type as string) || "all";

  let statement = ''

  return statement
}

const generateBoosterKeyCode = (
  effect: Effect
) => {
  const variableName = (effect.params.variable_name as string) || "keyvar";
  const changeType = (effect.params.booster_change_type as string) || "random";
  const specificBooster = (effect.params.specific_booster as string) || "none";
  const randomType = (effect.params.booster_random_type as string) || "all";

  let statement = ''

  return statement
}

const generateTagKeyCode = (
  effect: Effect
) => {
  const variableName = (effect.params.variable_name as string) || "keyvar";
  const changeType = (effect.params.tag_change_type as string) || "random";
  const specificTag = (effect.params.specific_tag as string) || "none";
  const randomType = (effect.params.tag_random_type as string) || "all";

  let statement = ''

  return statement
}