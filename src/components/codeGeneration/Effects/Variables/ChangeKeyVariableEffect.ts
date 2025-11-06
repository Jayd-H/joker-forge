import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../../Libs/effectUtils";
import { generateConfigVariables } from "../../Libs/gameVariableUtils";

export const generateChangeKeyVariableEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0,
): EffectReturn => {
  const keyType = (effect.params.key_type as string) || "joker"

  const variableName =
    sameTypeCount === 0 ? "increment_count" : `increment_count${sameTypeCount + 1}`;

  const { valueCode: numberCode, configVariables } = generateConfigVariables(
    getParamForKeyType(effect, keyType),
    effect.id,
    variableName,
    itemType,
  );
  
  const statement = generateKeyCode(effect, keyType, numberCode)   

  const result: EffectReturn = {
    statement: `__PRE_RETURN_CODE__${statement}
__PRE_RETURN_CODE_END__`,
    colour: "G.C.FILTER",
    configVariables
  };

  if (effect.customMessage) {
    result.message = `"${effect.customMessage}"`;
  }

  return result;
}

const getParamForKeyType = (
  effect: Effect,
  keyType: string
) => {
  switch(keyType){
    case "joker":
      if (effect.params?.joker_change_type as string === "increment")
        return effect.params?.joker_increment_count
      else return ''
    case "consumable":
      if (effect.params?.consumable_change_type as string === "increment")
        return effect.params?.consumable_increment_count
      else return ''
    case "enhancement":
      if (effect.params?.enhancement_change_type as string === "increment")
        return effect.params?.enhancement_increment_count
      else return ''
    case "seal":
      if (effect.params?.seal_change_type as string === "increment")
        return effect.params?.seal_increment_count
      else return ''
    case "edition":
      if (effect.params?.edition_change_type as string === "increment")
        return effect.params?.edition_increment_count
      else return ''
    case "booster":
      if (effect.params?.booster_change_type as string === "increment")
        return effect.params?.booster_increment_count
      else return ''
    case "voucher":
      if (effect.params?.voucher_change_type as string === "increment")
        return effect.params?.voucher_increment_count
      else return ''    
    case "tag":
      if (effect.params?.tag_change_type as string === "increment")
        return effect.params?.tag_increment_count
      else return ''
    default: 
      return ''
  }
}

const generateKeyCode = (
  effect: Effect, 
  keyType: string,
  numberCode: string,
) => {
  switch(keyType){
    case "joker":
      return generateJokerKeyCode(effect, numberCode)
    case "consumable":
      return generateConsumableKeyCode(effect, numberCode)
    case "enhancement":
      return generateEnhancementKeyCode(effect, numberCode)
    case "seal":
      return generateSealKeyCode(effect, numberCode)
    case "edition":
      return generateEditionKeyCode(effect, numberCode)
    case "booster":
      return generateBoosterKeyCode(effect, numberCode)
    case "voucher":
      return generateVoucherKeyCode(effect, numberCode)
    case "tag":
      return generateTagKeyCode(effect, numberCode)
    default: 
      return ''
  }
}

const generateJokerKeyCode = (
  effect: Effect,
  numberCode: string,
) => {
  const variableName = (effect.params.variable_name as string) || "keyvar";
  const changeType = (effect.params.joker_change_type as string) || "random";
  const specificJoker = (effect.params.specific_joker as string) || "none";
  const randomType = (effect.params.joker_random_type as string) || "all";
  const rarity = (effect.params.rarity as string) || "1";
  const pool = (effect.params.pool as string) || "";
  
  let valueCode = 'j_joker'
  let statement = '__PRE_RETURN_CODE__'

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
        for _, v in pairs(G.P_CENTER_POOLS.Joker) do
          if v.unlocked == true then
            possible_jokers[#possible_jokers + 1] = v.key
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
      end`
    } else if (randomType === "pool") {
      statement += `
        for _, v in pairs(G.P_CENTER_POOLS.Joker) do
          for _, pool in pairs(v.pools) do
            if pool == ${pool} then
              possible_jokers[#possible_jokers + 1] = v.key
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
        for _, v in pairs(G.P_CENTER_POOLS.Joker) do
          if v.rarity == '${rarity}' then
            possible_jokers[#possible_jokers + 1] = v.key
          end
        end`
    } else {
      statement += `
        for _, v in pairs(G.P_CENTER_POOLS.Joker) do
            possible_jokers[#possible_jokers + 1] = v.key
        end`
    }

    statement += `
      local random_joker_result = pseudorandom_element(possible_jokers, 'random joker')`

  } else if (changeType === "increment") {
    valueCode = `new_key`
    statement += `
      local new_key = 'none'
      for i, v in pairs(G.P_CENTER_POOLS.Joker) do
        if v.key == card.ability.extra.${changeType} then
          local index = i + ${numberCode}
          if index > #G.P_CENTER_POOLS.Joker then 
            index = index - #G.P_CENTER_POOLS.Joker
          end
          if index < 1 then 
            index = index + #G.P_CENTER_POOLS.Joker
          end
          new_key = G.P_CENTER_POOLS.Joker[index].key
        end
      end`
  } else {
    valueCode = `card.ability.extra.${changeType}`
  }

  statement += `
    card.ability.extra.${variableName} = ${valueCode}`;

  return statement 
}

const generateConsumableKeyCode = (
  effect: Effect,
  numberCode: string,
) => {
  const variableName = (effect.params.variable_name as string) || "keyvar";
  const changeType = (effect.params.consumable_change_type as string) || "random";
  const specificConsumable = (effect.params.specific_consumable as string) || "none";
  const randomType = (effect.params.consumable_random_type as string) || "all";
  const set = (effect.params.consumable_set as string) || "tarot"

  let statement = ''
  let valueCode = ''

  if (changeType === "used_consumable") {
    valueCode = `context.consumeable.config.center.key`
  } else if (changeType === "specific") {
    valueCode = `'${specificConsumable}'`
  } else if (changeType === "random") {
    valueCode = "random_consumable_result"
    statement += `local possible_consumables = {}`

    if (randomType === "all") {
      statement += `
        for _, v in pairs(G.P_CENTER_POOLS.Consumeables) do
            possible_consumables[#possible_consumables + 1] = v.key
        end`
    } else if (randomType === "set") {
      statement += `
        for _, v in pairs(G.P_CENTER_POOLS.Consumeables) do
          if v.set == '${set}' then
            possible_consumables[#possible_consumables + 1] = v.key
          end
        end`
    } else if (randomType === "owned") {
      statement += `
        for i = 1, #G.consumeables.cards do
            possible_consumables[#possible_consumables + 1] = G.consumeables.cards[i].config.center.key
        end`
    }
    statement += `
      local random_joker_result = pseudorandom_element(possible_jokers, 'random joker')`

  } else if (changeType === "increment") {
    valueCode = `new_key`
    statement += `
      local new_key = 'none'
      for i, v in pairs(G.P_CENTER_POOLS.Consumeables) do
        if v.key == card.ability.extra.${changeType} then
          local index = i + ${numberCode}
          if index > #G.P_CENTER_POOLS.Consumeables then 
            index = index - #G.P_CENTER_POOLS.Consumeables
          end
          if index < 1 then 
            index = index + #G.P_CENTER_POOLS.Consumeables
          end
          new_key = G.P_CENTER_POOLS.Consumeables[index].key
        end
      end`
  } else {
    valueCode = `card.ability.extra.${changeType}`
  }
  
  statement += `
    card.ability.extra.${variableName} = ${valueCode}`;


  return statement
}

const generateEnhancementKeyCode = (
  effect: Effect,
  numberCode: string,
) => {
  const variableName = (effect.params.variable_name as string) || "keyvar";
  const changeType = (effect.params.enhancement_change_type as string) || "random";
  const specificEnhancement = (effect.params.specific_enhancement as string) || "none";
  const randomType = (effect.params.enhancement_random_type as string) || "all";

  let statement = ''
  let valueCode = ''

  if (changeType === "scored_card" || changeType === "discarded_card" || changeType === "held_card") {
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
        for _, v in pairs(G.P_CENTER_POOLS.Enhanced) do
            possible_enhancements[#possible_enhancements + 1] = v.key
        end`
    } 
    statement += `
      local random_enhancement_result = pseudorandom_element(possible_enhancements, 'random enhancement')`
  } else if (changeType === "specific") {
    valueCode = `'${specificEnhancement}'`
  } else if (changeType === "increment") {
    valueCode = `new_key`
    statement += `
      local new_key = 'none'
      for i, v in pairs(G.P_CENTER_POOLS.Enhanced) do
        if v.key == card.ability.extra.${changeType} then
          local index = i + ${numberCode}
          if index > #G.P_CENTER_POOLS.Enhanced then 
            index = index - #G.P_CENTER_POOLS.Enhanced
          end
          if index < 1 then 
            index = index + #G.P_CENTER_POOLS.Enhanced
          end
          new_key = G.P_CENTER_POOLS.Enhanced[index].key
        end
      end`
  } else {
    valueCode = `card.ability.extra.${changeType}`
  }

  statement += `
              card.ability.extra.${variableName} = ${valueCode}`;

  return statement
}

const generateSealKeyCode = (
  effect: Effect,
  numberCode: string,
) => {
  const variableName = (effect.params.variable_name as string) || "keyvar";
  const changeType = (effect.params.seal_change_type as string) || "random";
  const specificSeal = (effect.params.specific_seal as string) || "none";
  const randomType = (effect.params.seal_random_type as string) || "all";

  let statement = ''
  let valueCode = ''

  if (changeType === "scored_card" || changeType === "discarded_card" || changeType === "held_card") {
    valueCode = `context.other_card.seal`
  } else if (changeType === "destroyed_card") {
    valueCode = `context.removed_card.seal`
  } else if (changeType === "added_card") {
    valueCode = `context.added_card.seal`
  } else if (changeType === "random") {
    valueCode = "random_seal_result"
    statement += `local possible_seals = {}`

    if (randomType === "all") {
      statement += `
        for _, v in pairs(G.P_CENTER_POOLS.Seal) do
            possible_seals[#possible_seals + 1] = v.key
        end`
    } 
    statement += `
      local random_seal_result = pseudorandom_element(possible_seals, 'random seal')`
  } else if (changeType === "specific") {
    valueCode = `'${specificSeal}'`
  } else if (changeType === "increment") {
    valueCode = `new_key`
    statement += `
      local new_key = 'none'
      for i, v in pairs(G.P_CENTER_POOLS.Seal) do
        if v.key == card.ability.extra.${variableName} then
          local index = i + ${numberCode}
          if index > #G.P_CENTER_POOLS.Seal then 
            index = index - #G.P_CENTER_POOLS.Seal
          end
          if index < 1 then 
            index = index + #G.P_CENTER_POOLS.Seal
          end
          new_key = G.P_CENTER_POOLS.Seal[index].key
        end
      end`
  } else {
    valueCode = `card.ability.extra.${changeType}`
  }

  statement += `
    card.ability.extra.${variableName} = ${valueCode}`;

  return statement
}

const generateEditionKeyCode = (
  effect: Effect,
  numberCode: string,
) => {
  const variableName = (effect.params.variable_name as string) || "keyvar";
  const changeType = (effect.params.edition_change_type as string) || "random";
  const specificEdition = (effect.params.specific_edition as string) || "none";
  const randomType = (effect.params.edition_random_type as string) || "all";

  let statement = ''
  let valueCode = ''

  if (changeType === "scored_card" || changeType === "discarded_card" || changeType === "held_card") {
    valueCode = `context.other_card.edition.key`
  } else if (changeType === "destroyed_card") {
    valueCode = `context.removed_card.edition.key`
  } else if (changeType === "added_card") {
    valueCode = `context.added_card.edition.key`
  } else if (changeType === "evaled_joker") {
    valueCode = "context.other_joker.config.edition.key"
  } else if (changeType === "selected_joker") {
    valueCode = "G.jokers.highlighted[1].edition.key"
  } else if (changeType === "random") {
    valueCode = "random_edition_result"
    statement += `local possible_editions = {}`

    if (randomType === "all") {
      statement += `
        for _, v in pairs(G.P_CENTER_POOLS.Edition) do
            possible_editions[#possible_editions + 1] = v.key
        end`
    } 
    statement += `
      local random_edition_result = pseudorandom_element(possible_editions, 'random edition')`
  } else if (changeType === "specific") {
    valueCode = `'${specificEdition}'`
  } else if (changeType === "increment") {
    valueCode = `new_key`
    statement += `
      local new_key = 'none'
      for i, v in pairs(G.P_CENTER_POOLS.Edition) do
        if v.key == card.ability.extra.${changeType} then
          local index = i + ${numberCode}
          if index > #G.P_CENTER_POOLS.Edition then 
            index = index - #G.P_CENTER_POOLS.Edition
          end
          if index < 1 then 
            index = index + #G.P_CENTER_POOLS.Edition
          end
          new_key = G.P_CENTER_POOLS.Edition[index].key
        end
      end`
  } else {
    valueCode = `card.ability.extra.${changeType}`
  }

  statement += `
    card.ability.extra.${variableName} = ${valueCode}`;

  return statement
}


const generateVoucherKeyCode = (
  effect: Effect,
  numberCode: string,
) => {
  const variableName = (effect.params.variable_name as string) || "keyvar";
  const changeType = (effect.params.voucher_change_type as string) || "random";
  const specificVoucher = (effect.params.specific_voucher as string) || "none";
  const randomType = (effect.params.voucher_random_type as string) || "all";

  let statement = ''
  let valueCode = ''

  if (changeType === "specific") {
    valueCode = `'${specificVoucher}`
  } else if (changeType === "random") {
    valueCode = 'random_voucher_result'
    statement += `local possible_vouchers = {}`

    if (randomType === "all") {
      statement += `
        for _, v in pairs(G.P_CENTER_POOLS.Voucher) do
            possible_vouchers[#possible_vouchers + 1] = v.key
        end`
    } else if (randomType === "possible") {
      statement += `
        for _, v in pairs(G.P_CENTER_POOLS.Voucher) do
          if v.available == true then
            possible_vouchers[#possible_vouchers + 1] = v.key
          end
        end`
    }
    statement += `
      local random_voucher_result = pseudorandom_element(possible_vouchers, 'random voucher')`
  } else if (changeType === "increment") {
    valueCode = `new_key`
    statement += `
      local new_key = 'none'
      for i, v in pairs(G.P_CENTER_POOLS.Voucher) do
        if v.key == card.ability.extra.${changeType} then
          local index = i + ${numberCode}
          if index > #G.P_CENTER_POOLS.Voucher then 
            index = index - #G.P_CENTER_POOLS.Voucher
          end
          if index < 1 then 
            index = index + #G.P_CENTER_POOLS.Voucher
          end
          new_key = G.P_CENTER_POOLS.Voucher[index].key
        end
      end`
  } else {
    valueCode = `card.ability.extra.${changeType}`
  }

  statement += `
    v.ability.extra.${variableName} = ${valueCode}`;

  return statement
}

const generateBoosterKeyCode = (
  effect: Effect,
  numberCode: string,
) => {
  const variableName = (effect.params.variable_name as string) || "keyvar";
  const changeType = (effect.params.booster_change_type as string) || "random";
  const specificBooster = (effect.params.specific_booster as string) || "none";
  const randomType = (effect.params.booster_random_type as string) || "all";
  const boosterKind = (effect.params.booster_category as string) || "Aracana"
  const boosterExtraCount =  (effect.params.booster_size_extra as string) || "3"
  const boosterChooseCount =  (effect.params.booster_size_choose as string) || "1"

  let statement = ''
  let valueCode = ''

  if (changeType === "opened_booster") {
    valueCode = `context.card.key`
  } else if (changeType === "skipped_booster") {
    valueCode = `context.booster.key`
  } else if (changeType === "specific") {
    valueCode = `'${specificBooster}`
  } else if (changeType === "random") {
    valueCode = 'random_booster_result'
    statement += `local possible_boosters = {}`

    if (randomType === "all") {
      statement += `
        for i = 1, #G.P_CENTER_POOLS.Booster do
          possible_boosters[#possible_boosters + 1] = G.P_CENTER_POOLS.Booster[i].key
        end`
    } else if (randomType === "category") {
      statement += `
        for i = 1, #G.P_CENTER_POOLS.Booster do
          if G.P_CENTER_POOLS.Booster[i].kind == "${boosterKind}" then
            possible_boosters[#possible_boosters + 1] = G.P_CENTER_POOLS.Booster[i].key
          end
        end`
    } else if (randomType === "size") {
      statement += `
        for i = 1, #G.P_CENTERS do
          if G.P_CENTER_POOLS.Booster[i].config.extra == ${boosterExtraCount} and G.P_CENTER_POOLS.Booster[i].config.choose == ${boosterChooseCount} then
            possible_boosters[#possible_boosters + 1] = G.P_CENTER_POOLS.Booster[i].key
          end
        end`
    }
    statement += `
      local random_booster_result = pseudorandom_element(possible_boosters, 'random booster')`
  } else if (changeType === "increment") {
    valueCode = `new_key`
    statement += `
      local new_key = 'none'
      for i, v in pairs(G.P_CENTER_POOLS.Booster) do
        if v.key == card.ability.extra.${changeType} then
          local index = i + ${numberCode}
          if index > #G.P_CENTER_POOLS.Booster then 
            index = index - #G.P_CENTER_POOLS.Booster
          end
          if index < 1 then 
            index = index + #G.P_CENTER_POOLS.Booster
          end
          new_key = G.P_CENTER_POOLS.Booster[index].key
        end
      end`
  } else {
    valueCode = `card.ability.extra.${changeType}`
  }

  statement += `
    card.ability.extra.${variableName} = ${valueCode}`;

  return statement
}
const generateTagKeyCode = (
  effect: Effect,
  numberCode: string,
) => {
  const variableName = (effect.params.variable_name as string) || "keyvar";
  const changeType = (effect.params.tag_change_type as string) || "random";
  const specificTag = (effect.params.specific_tag as string) || "none";
  const randomType = (effect.params.tag_random_type as string) || "all";

  let statement = ''
  let valueCode = ''

  if (changeType === "added_tag") {
    valueCode = `context.tag_added.key`
  } else if (changeType === "blind_tag") {
    valueCode = `currentTag`
    statement += `	
      local currentTag = 'none'		
      if G.GAME.blind:get_type() == "Small" then
				currentTag = G.GAME.round_resets.blind_tags.Small.key
			elseif G.GAME.blind:get_type() == "Big" then
				currentTag = G.GAME.round_resets.blind_tags.Big.key
			end`
  } else if (changeType === "specific") {
    valueCode = `'${specificTag}`
  } else if (changeType === "random") {
    valueCode = 'random_tag_result'
    statement += `local possible_tags = {}`

    if (randomType === "all") {
      statement += `
        for i = 1, #G.P_CENTER_POOLS.Tag do
            possible_tags[#possible_tags + 1] = G.P_CENTER_POOLS.Tag[i].key
        end`
    }
    statement += `
      local random_tag_result = pseudorandom_element(possible_tags, 'random tag')`
  } else if (changeType === "increment") {
    valueCode = `new_key`
    statement += `
      local new_key = 'none'
      for i, v in pairs(G.P_CENTER_POOLS.Tag) do
        if v.key == card.ability.extra.${changeType} then
          local index = i + ${numberCode}
          if index > #G.P_CENTER_POOLS.Tag then 
            index = index - #G.P_CENTER_POOLS.Tag
          end
          if index < 1 then 
            index = index + #G.P_CENTER_POOLS.Tag
          end
          new_key = G.P_CENTER_POOLS.Tag[index].key
        end
      end`
  } else {
    valueCode = `card.ability.extra.${changeType}`
  }

  statement += `
    card.ability.extra.${variableName} = ${valueCode}`;

  return statement
}