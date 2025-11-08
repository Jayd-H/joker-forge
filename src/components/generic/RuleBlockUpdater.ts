import { ConsumableData, DeckData, EditionData, EnhancementData, JokerData, SealData, VoucherData } from "../data/BalatroUtils";
import { getConditionTypeById } from "../data/Conditions";
import { getEffectTypeById } from "../data/Effects";
import { Condition, Effect, Rule } from "../ruleBuilder";

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

      (rule.conditionGroups || []).forEach(group => {group.conditions.forEach(condition => {
        condition = updateCondition(condition)
      })});

      (rule.effects|| []).forEach(effect => {
        effect = updateEffect(effect, item.objectType)
      });

      (rule.randomGroups || []).forEach(group => {group.effects.forEach(effect =>
        effect = updateEffect(effect, item.objectType)
      )});

      (rule.loops || []).forEach(group => {group.effects.forEach(effect =>
        effect = updateEffect(effect, item.objectType)
      )});

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
  condition: Condition
) => {

  condition.type = updateConditionId(condition.type)
  condition.params = updateConditionParams(condition.type, condition.params)

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
    default:
      return id
  }
}

const updateConditionParams = (
  id: string, 
  params: Record <string, unknown>
): Record <string, unknown> => {
  const condition = getConditionTypeById(id)
  for (const key in params) {
    if (!params[key]) {
      const param = condition?.params.find(param => param.id === key)
      params[key] = param?.default
    }
  }

  condition?.params.forEach(param => {
    const key = param.id
    if (!params[key]) {
      const param = condition?.params.find(param => param.id === key)
      params[key] = param?.default
    }
  })

  return params
}

const updateEffect = (
  effect: Effect,
  itemType: string,
) => {
  const oldEffectId = effect.type
  effect.type = updateEffectId(oldEffectId, itemType)
  effect.params = updateEffectParams(oldEffectId, itemType, effect.params)
  effect.params = updateMissingEffectParams(effect.type, effect.params)

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
    case "Win_blind":
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
    case "retrigger_card":
      return "retrigger_cards"
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
    case "modify_base_blind_requirement":
      return "modify_all_blinds_requirement"

    default:
      return id
  }
}

// For similar effects that are merged and have params defining their effect
const updateEffectParams = (
  id: string, 
  itemType: string,
  params: Record <string, unknown>
): Record <string, unknown> => {

  switch (id) {
    case "destroy_random_cards":
      params["method"] = 'random'
      break
    case "destroy_selected_cards":
      params["method"] = 'selected'
      break
    case "copy_triggered_card_to_hand":
    case "copy_played_card_to_hand":
      params["add_to"] = "hand"
      break
    case "copy_triggered_card":
    case "copy_played_card":
      params["add_to"] = "deck"
      break   
    case "edit_cards_in_hand":
      params["selection_method"] = "selected" 
      break
    case "add_card_to_deck":
      params["location"] = "deck"
      break
    case "add_card_to_hand":
      params["location"] = "hand"
      break
    case "destroy_self":
      if (itemType === "joker") {
        params["selection_method"] = "self"
      }
      break
    case "double_dollars":
      params["max_earnings"] = params["limit"]
      params["limit_dollars"] = [false, true, false, false]
      break
    case "edit_selected_joker":
      params["target"] = "selected_joker"
      break
    case "add_dollars_from_jokers":
      params["value"] = "GAMEVAR:all_jokers_sell_value"
      break
  }

  return params
}

// For filling in any newly added params with blank values on prior effects
const updateMissingEffectParams = (
  id: string, 
  params: Record <string, unknown>
): Record <string, unknown> => {
  const effect = getEffectTypeById(id)

  for (const key in params) {
    if (!params[key]) {
      const param = effect?.params.find(param => param.id === key)
      params[key] = param?.default
    }
  }

  effect?.params.forEach(param => {
    const key = param.id
    if (!params[key]) {
      const param = effect?.params.find(param => param.id === key)
      params[key] = param?.default
    }
  })

  return params
}
