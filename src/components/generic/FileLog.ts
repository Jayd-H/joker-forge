import { getConditionsForTrigger } from "../data/Conditions";
import { getEffectsForTrigger } from "../data/Effects";

export const logSelectedTrigger = (
  triggerId: string | undefined,
  itemType: string,
) => {
  if (!triggerId) {
    console.log('ERROR: NO TRIGGER ID')
    return
  }
  const conditions = getConditionsForTrigger(triggerId, itemType)

  const effects = getEffectsForTrigger(triggerId, itemType)

  console.log(`
    ITEM TYPE: ${itemType}
    TRIGGER: ${triggerId}
    CONDITIONS (${conditions.length}):
      ${conditions.map(c => c.id).join('\n      ')}
    EFFECTS (${effects.length}): 
      ${effects.map(e => e.id).join('\n      ')}
    `)

  return 
}