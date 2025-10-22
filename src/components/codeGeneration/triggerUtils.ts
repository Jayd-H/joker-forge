import type { Rule } from "../ruleBuilder/types";

export const generateTriggerContext = (
  objectType: "joker" | "consumable" | "card" | "voucher" | "deck",
  triggerType: string,
  rules?: Rule[],
): string => {

  const hasRetriggerEffects = (objectType === "joker") && rules?.some((rule) =>
    rule.effects.some((effect) => effect.type === "retrigger_cards")
  );

  const isBlueprintCompatible = (objectType === "joker") && rules?.some((rule) => 
    rule.blueprintCompatible ?? true
);

  switch (triggerType) {
    case "card_used":
      switch (objectType) {
        case "consumable":
          return `context.joker_main`
        default:
          return ""
      }

    case "hand_played":
      switch (objectType) {
        case "joker":
          return `context.cardarea == G.jokers and context.joker_main ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
      }
      break

    case "card_scored":
      switch (objectType) {
        case "joker":
          if (hasRetriggerEffects) {
            return `context.repetition and context.cardarea == G.play ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
          } else {
            return `context.individual and context.cardarea == G.play ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
          }
        case "card":
          return "context.main_scoring and context.cardarea == G.play"
      }
      break

    case "card_destroyed":
      switch(objectType) {
        case "joker":
          return `context.remove_playing_cards ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
      }
      break

    case "first_hand_drawn":
      switch(objectType) {
        case "joker":
          return `context.first_hand_drawn ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
      }
      break
    
    case "hand_drawn":
      switch(objectType) {
        case "joker":
          return `context.hand_drawn ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
      }
      break

    case "hand_discarded":
      switch(objectType) {
        case "joker":
          return `context.pre_discard ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
      }
      break
    
    case "card_discarded":
      switch(objectType) {
        case "joker":
          return `context.discard ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
        case "card":
          return "context.discard and context.other_card == card"
      }
      break

    case "card_held_in_hand":
      switch(objectType) {
        case "joker":
          if (hasRetriggerEffects) {
            return `context.repetition and context.cardarea == G.hand and context.end_of_round and (next(context.card_effects[1]) or #context.card_effects > 1) ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
          } else {
            return `context.cardarea == G.hand and context.end_of_round ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
          }
        case "card":
          return "context.cardarea == G.hand and context.main_scoring"
      }
      break

    case "card_held_in_hand_end_of_round":
      switch(objectType) {
        case "joker":
          if (hasRetriggerEffects) {
            return `context.repetition and context.cardarea == G.hand and context.end_of_round and (next(context.card_effects[1]) or #context.card_effects > 1) ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
          } else {
            return `context.cardarea == G.hand and context.end_of_round ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
          }
        case "card":
          return "context.end_of_round and context.cardarea == G.hand and context.other_card == card and context.individual"
      }
      break

    case "playing_card_added":
      switch(objectType) {
        case "joker":
          return `context.playing_card_added ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
      }
      break

    case "before_hand_played":
      switch(objectType) {
        case "joker":
          return `context.before and context.cardarea == G.jokers ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
      }
      break
    
    case "joker_evaluated":
      switch(objectType) {
        case "joker":
          return `context.other_joker ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
      }
      break
      
    case "after_hand_played":
      switch(objectType) {
        case "joker":
          return `context.after and context.cardarea == G.jokers ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
      }
      break
      
    case "round_end":
      switch(objectType) {
        case "joker":
          return `context.end_of_round and context.game_over == false and context.main_eval ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
        default:
          return `context.end_of_round and context.game_over == false and context.main_eval`
      }
      
    case "blind_selected":
      switch(objectType) {
        case "joker":
          return `context.setting_blind ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
        default:
          return `context.setting_blind`
      }
      
    case "blind_skipped":
      switch(objectType) {
        case "joker":
          return `context.skip_blind ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
        default: 
          return `context.skip_blind`
      }
      
    case "boss_defeated":
      switch(objectType) {
        case "joker":
          return `context.end_of_round and context.main_eval and G.GAME.blind.boss ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
        default:
          return `context.end_of_round and context.main_eval and G.GAME.blind.boss`
      }
      
    case "booster_opened":
      switch(objectType) {
        case "joker":
          return `context.open_booster ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
        default: 
          return `context.open_booster`
      }
      
    case "booster_skipped":
      switch(objectType) {
        case "joker":
          return `context.skipping_booster ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
        default:
          return `context.skipping_booster`
      }
      
    case "shop_entered":
      switch(objectType) {
        case "joker":
          return `context.starting_shop ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
        default:
          return `context.starting_shop`
      }
      
    case "shop_exited":
      switch(objectType) {
        case "joker":
          return `context.ending_shop ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
        default:
          return `context.ending_shop`
      }
      
    case "tag_added":
      switch(objectType) {
        case "joker":
          return `context.tag_added ${isBlueprintCompatible ? '' : 'and not context.blueprint'}`
      }
      break
      
    case "selling_self":
      switch(objectType) {
        case "joker":
          return `context.selling_self ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
      }
      break
            
    case "card_sold":
      switch(objectType) {
        case "joker":
          return `context.selling_card ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
      }
      break
            
    case "buying_self":
      switch(objectType) {
        case "joker":
          return `context.buying_card and context.card.config.center.key == self.key and context.cardarea == G.jokers ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
      }
      break
            
    case "card_bought":
      switch(objectType) {
        case "joker":
          return `context.buying_card ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
      }
      break
            
    case "shop_reroll":
      switch(objectType) {
        case "joker":
          return `context.reroll_shop ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
      }
      break
            
    case "consumable_used":
      switch(objectType) {
        case "joker":
          return `context.using_consumeable ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
      }
      break
            
    case "game_over":
      switch(objectType) {
        case "joker":
          return `context.end_of_round and context.game_over and context.main_eval ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
      }
      break
                  
    case "ante_start":
      switch(objectType) {
        case "joker":
          return `context.ante_change ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
      }
      break

    case "probability_result":
      switch(objectType) {
        case "joker":
          return `context.pseudorandom_result ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`
      }
      break
      
  }
  return ``
}