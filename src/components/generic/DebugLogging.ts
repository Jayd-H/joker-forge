import { getConditionsForTrigger } from "../data/Conditions"
import { getEffectsForTrigger } from "../data/Effects"
import { getTriggers } from "../data/Triggers"

export const logAllRuleCards = () => {
  const itemTypes = ['joker', 'consumable', 'card', 'voucher', 'deck']
  const allLogs: string[] = []

  itemTypes.forEach(type => {
    const triggers = getTriggers(type)
    triggers.forEach(trigger => {
      const conditions = getConditionsForTrigger(trigger.id, type)
      const effects = getEffectsForTrigger(trigger.id, type)

      allLogs.push(`
        TYPE: ${type}
        TRIGGER: ${trigger.id}
        CONDITIONS: 
          ${conditions.map(condition => condition.id).join(`\n          `)}
        EFFECTS: 
        ${effects.map(effect => effect.id).join(`\n          `)}
        `)
    })
  })

  console.log(allLogs.join(`
---------------------------------------
`))
}