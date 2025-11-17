export const generateOperationCode = (
  operation: string,
  comparisonValue: string,
  valueCode: string
) => {
  switch (operation) {
    case "greater_than": 
      return `to_big(${comparisonValue}) > to_big(${valueCode})`
    case "greater_than_or_equal": case "greater_equals":
      return `to_big(${comparisonValue}) >= to_big(${valueCode})`
    case "less_than":
      return `to_big(${comparisonValue}) < to_big(${valueCode})`
    case "less_than_or_equal": case "less_equals":
      return `to_big(${comparisonValue}) <= to_big(${valueCode})`
    case "not_equals": case "not_equal":
      return `to_big(${comparisonValue}) ~= to_big(${valueCode})`
    case "equals":
    default:
      return `to_big(${comparisonValue}) == to_big(${valueCode})`
  }
}

export const generateObjectContextCode = (
  context: string,
  getCard?: boolean,
) => {
  if (getCard) {
    switch (context) {
      case "evaled_joker":
        return "context.other_joker"
      case "selected_joker":
        return "G.jokers.highlighted[1]" 
      case "scored_card": case "discarded_card": case "held_card":
        return "context.other_card"
      case "destroyed_card":
        return "context.removed_card"
      case "added_card":
        return "context.added_card"
      default:
        return ""
    }
  }

  switch (context) {
    case "evaled_joker_key":
      return "context.other_joker.config.center.key"
    case "selected_joker_key":
      return "G.jokers.highlighted[1].config.center.key"

    case "used_consumable":
      return "context.consumeable.config.center.key"

    case "scored_card_suit": case "discarded_card_suit": case "held_card_suit":
      return "context.other_card.base.suit"
    case "destroyed_card_suit":
      return "context.removed_card.base.suit"
    case "added_card_suit":
      return "context.added_card.base.suit"

    case "scored_card_rank": case "discarded_card_rank": case "held_card_rank":
      return "context.other_card.base.id"
    case "destroyed_card_rank":
      return "context.removed_card.base.id"
    case "added_card_rank":
      return "context.added_card.base.id"

    case "scored_card_enhancement": case "discarded_card_enhancement": case "held_card_enhancement":
      return "context.other_card.config.center.key"
    case "destroyed_card_enhancement":
      return "context.removed_card.config.center.key"
    case "added_card_enhancement":
      return "context.added_card.config.center.key"

    case "scored_card_seal": case "discarded_card_seal": case "held_card_seal":
      return "context.other_card.seal"
    case "destroyed_card_seal":
      return "context.removed_card.seal"
    case "added_card_seal":
      return "context.added_card.seal"

    case "scored_card_edition": case "discarded_card_edition": case "held_card_edition":
      return "context.other_card.edition.key"
    case "destroyed_card_edition":
      return "context.removed_card.edition.key"
    case "added_card_edition":
      return "context.added_card.edition.key"
    case "evaled_joker_edition":
      return "context.other_joker.config.edition.key"
    case "selected_joker_edition":
      return "G.jokers.highlighted[1].edition.key"

    case "opened_booster":
      return "valueCode = `context.card.key"
    case "skipped_booster": case "exited_booster":
      return "context.booster.key"
    case "added_tag":
      return "context.tag_added.key"

    default:
      return `card.ability.extra.${context}` // If its a Variable
  }
}