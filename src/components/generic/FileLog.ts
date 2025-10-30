import { getCardConditionsForTrigger } from "../data/Card/Conditions"
import { getCardEffectsForTrigger } from "../data/Card/Effects"
import { getConsumableConditionsForTrigger } from "../data/Consumables/Conditions"
import { getConsumableEffectsForTrigger } from "../data/Consumables/Effects"
import { getDeckConditionsForTrigger } from "../data/Decks/Conditions"
import { getDeckEffectsForTrigger } from "../data/Decks/Effects"
import { getConditionsForTrigger } from "../data/Jokers/Conditions"
import { getEffectsForTrigger } from "../data/Jokers/Effects"
import { getVoucherConditionsForTrigger } from "../data/Vouchers/Conditions"
import { getVoucherEffectsForTrigger } from "../data/Vouchers/Effects"

export const logSelectedTrigger = (
  triggerId: string | undefined,
  itemType: string,
) => {
  if (!triggerId) {
    console.log('ERROR: NO TRIGGER ID')
    return
  }
  const conditions =
    itemType === "joker"
      ? getConditionsForTrigger(triggerId)
      : itemType === "consumable"
      ? getConsumableConditionsForTrigger(triggerId)
      : itemType === "card"
      ? getCardConditionsForTrigger(triggerId)
      : itemType === "voucher"
      ? getVoucherConditionsForTrigger(triggerId)
      : getDeckConditionsForTrigger(triggerId);

  const effects =
    itemType === "joker"
      ? getEffectsForTrigger(triggerId)
      : itemType === "consumable"
      ? getConsumableEffectsForTrigger(triggerId)
      : itemType === "card"
      ? getCardEffectsForTrigger(triggerId)
      : itemType === "voucher"
      ? getVoucherEffectsForTrigger(triggerId)
      : getDeckEffectsForTrigger(triggerId);

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