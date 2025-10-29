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
    objectType.forEach(item => {item.rules?.forEach(rule => {

      rule.trigger = updateTrigger(rule)

      rule.conditionGroups.forEach(group => {group.conditions.forEach(condition => {
        condition = updateCondition(condition)
      })})

      rule.effects.forEach(effect => {
        effect = updateEffect(effect)
      })

      rule.randomGroups.forEach(group => {group.effects.forEach(effect =>
        effect = updateEffect(effect)
      )})

      rule.loops.forEach(group => {group.effects.forEach(effect =>
        effect = updateEffect(effect)
      )})

    })
  })
  }) 
}

const updateTrigger = (
  rule: Rule
) => {
  switch(rule.trigger) {
    case "consumable_used": case "voucher_redeemed": case "deck_selected":
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

  condition.id = updateConditionId(condition.id)
  condition.params = updateConditionParams(condition.id, condition.params)

  return condition
}

const updateConditionId = (
  id: string
) => {
  switch(id) {
    case "card_count":
      return "hand_count"
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

  for (const key in condition?.params.map(param => param.id)) {
    if (!params[key]) {
      const param = condition?.params.find(param => param.id === key)
      params[key] = param?.default
    }
  }

  return params
}

const updateEffect = (
  effect: Effect
) => {
  const oldEffectId = effect.id
  effect.id = updateEffectId(oldEffectId)
  effect.params = updateEffectParams(oldEffectId, effect.params)
  effect.params = updateMissingEffectParams(effect.id, effect.params)

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
      return "edit_card"

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
      params['method'] = 'random'
      break
    case "destroy_selected_cards":
      params['method'] = 'selected'
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

  for (const key in effect?.params.map(param => param.id)) {
    if (!params[key]) {
      const param = effect?.params.find(param => param.id === key)
      params[key] = param?.default
    }
  }

  return params
}
