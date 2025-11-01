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

      rule.trigger = updateTrigger(rule);

      (rule.conditionGroups || []).forEach(group => {group.conditions.forEach(condition => {
        condition = updateCondition(condition)
      })});

      (rule.effects|| []).forEach(effect => {
        effect = updateEffect(effect)
      });

      (rule.randomGroups || []).forEach(group => {group.effects.forEach(effect =>
        effect = updateEffect(effect)
      )});

      (rule.loops || []).forEach(group => {group.effects.forEach(effect =>
        effect = updateEffect(effect)
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
  rule: Rule
) => {
  switch(rule.trigger) {
    case "consumable_used": 
    case "voucher_redeemed":
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
  effect: Effect
) => {
  const oldEffectId = effect.type
  effect.type = updateEffectId(oldEffectId)
  effect.params = updateEffectParams(oldEffectId, effect.params)
  effect.params = updateMissingEffectParams(effect.type, effect.params)

  return effect
}

const updateEffectId = (
  id: string
) => {
  switch(id) {
    case "add_dollars":
    case "edit_dollars":
      return "set_dollars"
    case "destroy_card":
      return "destroy_self"
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

    default:
      return id
  }
}

// For similar effects that are merged and have params defining their effect
const updateEffectParams = (
  id: string, 
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
