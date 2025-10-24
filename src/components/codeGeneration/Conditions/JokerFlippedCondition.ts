export const generateJokerFlippedConditionCode = (
  itemType: string,
  target: string,
): string | null => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(target)
    case "consumable":
      return generateConsumableCode()
  }
  return null
}

const generateJokerCode = (
  target: string
): string | null => {
  switch (target){
    case "other":
      return `(function()
          return context.other_joker.facing == "back"
      end)()`
    case "self":
      return `(function()
          return card.facing == "back"
      end)()`
  }
  return null
}

const generateConsumableCode = (
): string | null => {
  return `(function()
      return G.jokers.highlighted[1].facing == "back" == true
  end)()`
}