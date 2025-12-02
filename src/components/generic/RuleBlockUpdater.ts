import { ConsumableData, DeckData, EditionData, EnhancementData, JokerData, SealData, VoucherData } from "../data/BalatroUtils";
import { getConditionTypeById } from "../data/Conditions";
import { getEffectTypeById } from "../data/Effects";
import { Condition, Effect, RandomGroup, Rule } from "../ruleBuilder";
import { LoopGroup } from "../ruleBuilder/types";

export const updateRuleBlocks = (
  jokers: JokerData[],
  consumables: ConsumableData[],
  enhancements: EnhancementData[],
  seals: SealData[],
  editions: EditionData[],
  vouchers: VoucherData[],
  decks: DeckData[]
) => {
  const allData = [jokers, consumables, enhancements, seals, editions, vouchers, decks]

  allData.forEach(objectType => {
    objectType.forEach(item => {      
      item.rules?.forEach(rule => {

      rule.trigger = updateTrigger(rule, item.objectType);

      (rule.conditionGroups || []).forEach(group => {group.conditions.map(condition => 
        updateCondition(condition, item)
      )});

      (rule.effects|| []).map(effect => 
        updateEffect(effect, item.objectType, item)
      );

      (rule.randomGroups || []).forEach(group => {group.effects.map(effect =>
        updateEffect(effect, item.objectType, item)
      )
      updateRandomGroup(group, item)
    });

      (rule.loops || []).forEach(group => {group.effects.map(effect =>
        updateEffect(effect, item.objectType, item)
      )
      updateLoopGroup(group, item)
    });


    })})
  }) 
  return {
    jokers,
    consumables, 
    enhancements,
    seals, 
    editions,
    vouchers,
    decks
  }
}

const updateTrigger = (
  rule: Rule,
  itemType: string,
) => {
  switch(rule.trigger) {
    case "consumable_used":
      if (itemType === "consumable") 
        return "card_used"
      else 
        return "consumable_used"
    case "voucher_used":
    case "deck_selected":
      return "card_used"
    case "card_held":
      return "card_held_in_hand"
    default:
      return rule.trigger
  }
}

const updateCondition = (
  condition: Condition,
  object: JokerData | EnhancementData | SealData | EditionData
) => {
  if (Object.values(condition.params).some(value => typeof value !== "object")) {
    condition.params = convertParamsToObjects(condition.params, object)
  }

  condition.type = updateConditionId(condition.type)
  condition.params = updateConditionParams(condition.type, condition.params, object)

  return condition
}

const updateConditionId = (
  id: string
) => {
  switch(id) {
    case "card_count":
      return "hand_count"
    case "edit_dollars_selected":
      return "edit_starting_dollars"
    case "deck_check":
      return "check_deck"
    case "blind_requirements":
      return "check_blind_requirements"
    case "poker_hand":
      return "hand_type"
    case "destroy_selected_cards":
      return "destroy_cards"
    case "joker_specific":
      return "joker_key"
    default:
      return id
  }
}

const updateConditionParams = (
  id: string, 
  params: Record <string, {value: unknown, valueType?: string}>,
  object: JokerData | EnhancementData | SealData | EditionData
): Record <string, {value: unknown, valueType?: string}> => {
  const condition = getConditionTypeById(id)
  for (const key in params) {
    const param = condition?.params.find(param => param.id === key)
    params[key] = {
      value: params[key]?.value ?? param?.default,
      valueType: params[key]?.valueType ?? detectValueType(param?.default, object)
    }       
  }

  condition?.params.forEach(param => {
    const key = param.id
    params[key] = {
      value: params[key]?.value ?? param?.default,
      valueType: params[key]?.valueType ?? detectValueType(param?.default, object)
    }       
  })

  Object.keys(params).forEach((key) => {
    params[key].valueType = (params[key].valueType || "unknown").toLowerCase()
    if (typeof params[key].value === "object") {
      const object = params[key].value as {value: unknown, valueType?: string}
      params[key].value = object.value
    }
  })

  return params
}

const updateEffect = (
  effect: Effect,
  itemType: string,
  object: JokerData | EnhancementData | SealData | EditionData
) => {
  const oldEffectId = effect.type
  effect.type = updateEffectId(oldEffectId, itemType)
  if (Object.values(effect.params).some(value => typeof value !== "object")) {
    effect.params = convertParamsToObjects(effect.params, object)
  }
  effect.params = updateEffectParams(oldEffectId, itemType, effect.params)
  effect.params = updateMissingEffectParams(effect.type, effect.params, object)

  return effect
}

const updateEffectId = (
  id: string,
  itemType: string,
) => {
  switch(id) {
    case "balance":
      return "balance_chips_mult"
    case "destroy_self":
      if (itemType === "joker") {
        return "destroy_joker"
      }
      return id
    case "win_blind":
      return "beat_current_blind"
    case "add_dollars":
    case "edit_dollars":
      return "set_dollars"
    case "destroy_random_cards":
      return "destroy_cards"
    case "edit_Shop_Prices":
      return "discount_items"
    case "edit_triggered_card":
      return "edit_playing_card"
    case "copy_triggered_card_to_hand":
    case "copy_triggered_card":
      return "create_copy_triggered_card"
    case "copy_played_card_to_hand":
    case "copy_played_card":
      return "create_copy_played_card"
    case "edit_hand":
      return "edit_hands"
    case "edit_discard":
      return "edit_discards"
    case "edit_card_apperance":
      return "edit_card_appearance"
    case "edit_cards_in_hand":
      return "edit_cards"
    case "add_card_to_deck":
    case "add_card_to_hand":
      return "create_playing_card"
    case "add_x_mult":
      return "apply_x_mult"
    case "add_x_chips":
      return "apply_x_chips"
    case "add_exp_mult":
      return "apply_exp_mult"
    case "add_exp_chips":
      return "apply_exp_chips"
    case "add_hyper_mult":
      return "apply_hyper_mult"
    case "add_hyper_chips":
      return "apply_hyper_chips"
    case "retrigger_card": case "retrigger_cards":
      return "retrigger_playing_card"
    case "destroy_card":
      return "destroy_playing_card"
    case "perma_bonus":
      return "permanent_bonus"
    case "double_dollars":
    case "add_dollars_from_jokers":
      return "set_dollars"
    case "edit_selected_joker":
    case "edition_random_joker":
      return "edit_joker"
    case "destroy_selected_cards":
      return "destroy_cards"
    case "add_cards_to_hand":
      return "create_playing_cards"
    case "edit_dollars_selected":
      return "edit_starting_dollars"
    case "edit_raity_weight":
      return "edit_rarity_weight"
    case "modify_base_blind_requirement": case "modify_blind_requirement":
      if (itemType === "deck")  
        return "modify_all_blinds_requirement"
      else return id
    case "edit_rerolls":
      return "edit_reroll_price"
    case "delete_triggered_card":
      return "destroy_playing_card"

    default:
      return id
  }
}

// For similar effects that are merged and have params defining their effect
const updateEffectParams = (
  id: string, 
  itemType: string,
  params: Record <string, {value: unknown, valueType?: string}>
): Record <string, {value: unknown, valueType?: string}> => {

  switch (id) {
    case "destroy_random_cards":
      params["method"] =  {value: "random", valueType: "text"}
      break
    case "destroy_selected_cards":
      params["method"] =  {value: "selected", valueType: "text"}
      break
    case "copy_triggered_card_to_hand":
    case "copy_played_card_to_hand":
      params["add_to"] =  {value: "hand", valueType: "text"}
      break
    case "copy_triggered_card":
    case "copy_played_card":
      params["add_to"] =  {value: "deck", valueType: "text"}
      break   
    case "edit_cards_in_hand":
      params["selection_method"] =  {value: "selected", valueType: "text"}
      break
    case "add_card_to_deck":
      params["location"] =  {value: "deck", valueType: "text"}
      break
    case "add_card_to_hand":
      params["location"] =  {value: "hand", valueType: "text"}
      break
    case "destroy_self":
      if (itemType === "joker") {
        params["selection_method"] = {value: "self", valueType: "text"}
      }
      break
    case "double_dollars":
      params["max_earnings"] = {value: params["limit"], valueType: detectValueType(params["limit"])}
      params["limit_dollars"] = {value: [false, true, false, false], valueType: "checkbox"}
      break
    case "edit_selected_joker":
      params["target"] = {value: "selected_joker", valueType: "context"}
      break
    case "add_dollars_from_jokers":
      params["value"] = {value: "GAMEVAR:all_jokers_sell_value", valueType: "game_var"}
      break
  }
  return params
}

// For filling in any newly added params with blank values on prior effects
const updateMissingEffectParams = (
  id: string, 
  params: Record <string, {value: unknown, valueType?: string}>,
  object: JokerData | EnhancementData | SealData | EditionData,
): Record <string, {value: unknown, valueType?: string}> => {
  const effect = getEffectTypeById(id)

  for (const key in params) {
    const param = effect?.params.find(param => param.id === key)
    params[key] = {
      value: params[key]?.value ?? param?.default,
      valueType: params[key]?.valueType ?? detectValueType(param?.default, object)
    }
  }

  effect?.params.forEach(param => {
    const key = param.id
    params[key] = {
      value: params[key]?.value ?? param?.default,
      valueType: params[key]?.valueType ?? detectValueType(param?.default, object)
    } 
  })
  
  Object.keys(params).forEach((key) => {
    params[key].valueType = (params[key].valueType || "unknown").toLowerCase()
    if (typeof params[key].value === "object") {
      const object = params[key].value as {value: unknown, valueType?: string}
      params[key].value = object.value
    }
  })

  return params
}

const updateRandomGroup = (
  group: RandomGroup,
  object?: JokerData | EnhancementData | SealData | EditionData
) => {
  if (typeof group.chance_numerator !== "object") {
    group.chance_numerator = {
      value: group.chance_numerator,
      valueType: detectValueType(group.chance_numerator, object)
    }
  }
  if (typeof group.chance_denominator !== "object") {
    group.chance_denominator = {
      value: group.chance_denominator,
      valueType: detectValueType(group.chance_denominator, object)
    }
  }
  return group
}

const updateLoopGroup = (
  group: LoopGroup,
  object?: JokerData | EnhancementData | SealData | EditionData
) => {
  if (typeof group.repetitions !== "object") {
    group.repetitions = {
      value: group.repetitions,
      valueType: detectValueType(group.repetitions, object)
    }
  }
  return group
}

const convertParamsToObjects = (
  params: Record<string, unknown>,
  object: JokerData | EnhancementData | SealData | EditionData,
): Record<string, {value: unknown, valueType?: string}> => {
  const newRecord: Record<string, {value: unknown, valueType?: string}> = {}
  Object.entries(params).forEach(([key, item]) => {
    if (typeof newRecord[key] !== "object") {
      newRecord[key] = {
        value: item,
        valueType: detectValueType(item, object)
      }
    }
  })

  return newRecord
}

export const detectValueType = (
  item: unknown, 
  object?: JokerData | EnhancementData | SealData | EditionData
) => {
  if (Array.isArray(item) && typeof item[0] === "boolean") {
    return "checkbox"
  } else if (typeof item === "string") {
    if (item.startsWith("GAMEVAR")) {
      return "game_var"
    } else if (item.startsWith("RANGE")) {
      return "range_var"
    } else if (object && object.userVariables?.some((v) => v.name === item)) {
      return "user_var"
    }
  } else if (typeof item === "number") {
    return "number"
  }

  return undefined
}