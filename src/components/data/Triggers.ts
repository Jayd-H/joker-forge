import { BanknotesIcon, ClockIcon, HandRaisedIcon, PlayIcon, RectangleStackIcon, ShoppingCartIcon, SparklesIcon, TicketIcon } from "@heroicons/react/24/outline";
import { GlobalTriggerDefinition } from "../ruleBuilder/types";

export interface CategoryDefinition {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const TRIGGER_CATEGORIES: CategoryDefinition[] = [
  {
    label: "Usage",
    icon: TicketIcon,
  },
  {
    label: "Hand Scoring",
    icon: HandRaisedIcon,
  },
  {
    label: "In Blind Events",
    icon: PlayIcon,
  },
  { 
    label: "Round Events",
    icon: ClockIcon,
  },
  {
    label: "Economy",
    icon: BanknotesIcon,
  },
  {    
    label: "Packs & Consumables",
    icon: RectangleStackIcon,
  },
  {    
    label: "Shop Events",
    icon: ShoppingCartIcon,
  },
  {    
    label: "Special",
    icon: SparklesIcon,
  },
];

export const TRIGGERS: GlobalTriggerDefinition[] = [
  {
    id: "card_used",
    label: {
      voucher: "When Voucher is Redeemed",
      deck: "When This Deck is Selected",
      consumable: "When Consumable is Used",
    },
    description: {
      voucher: "Triggers when this Voucher is redeemed by the player",
      deck: "Triggers when this deck is activated by the player",
      consumable: "Triggers when this Consumable is activated by the player",
    },
    category: "Usage",
    objectUsers: ["consumable", "voucher", "deck"],
  },
  {
    id: "hand_played",
    label: {
      joker: "When a Hand is Played",
    },
    description: {
      joker: "Triggers when any hand is played. Use conditions to specify whether to check scoring cards, all played cards, or specific hand types.",
    },
    category: "Hand Scoring",
    objectUsers: ["joker"],
  },
  {
    id: "card_scored",
    label: {
      joker: "When any Card is Scored",
      card: "When Card is Scored",
    },
    description: {
      joker: "Triggers for each individual card during scoring. Use this for card-specific properties like suit, rank, or enhancements.",
      card: "Triggers when this card is part of a scoring hand",
    },
    category: "Hand Scoring",
    objectUsers: ["joker", "card"],
  },
  {
    id: "card_destroyed",
    label: {
      joker: "When a Card is Destroyed",
    },
    description: {
      joker: "Triggers when cards are destroyed (e.g. by Glass Cards breaking, being eaten by jokers, sacrificed by consumables).",
    },
    category: "Special",
    objectUsers: ["joker"],
  },
  {
    id: "first_hand_drawn",
    label: {
      joker: "When First Hand is Drawn",
    },
    description: {
      joker: "Triggers only for the first hand drawn in each round.",
    },
    category: "In Blind Events",
    objectUsers: ["joker"],
  },
  {
    id: "hand_drawn",
    label: {
      joker: "When a Hand is Drawn",
    },
    description: {
      joker: "Triggers when the player draws a new hand of cards.",
    },
    category: "In Blind Events",
    objectUsers: ["joker"],
  },
  {
    id: "hand_discarded",
    label: {
      joker: "When a Hand is Discarded",
    },
    description: {
      joker: "Triggers when the player discards a hand of cards (before the discard happens). Different from 'When a Card is Discarded' which triggers per individual card.",
    },
    category: "In Blind Events",
    objectUsers: ["joker"],
  },
  {
    id: "card_discarded",
    label: {
      joker: "When a Card is Discarded",
      card: "When Card is Discarded", 
    },
    description: {
      joker: "Triggers whenever a card is discarded. Use conditions to check properties of the discarded card.",
      card: "Triggers whenever a card is discarded. Use conditions to check properties of the discarded card.",
    },    
    category: "In Blind Events",
    objectUsers: ["joker", "card"],
  },
  {
    id: "card_held_in_hand",
    label: {
      joker: "When a Card is Held in Hand",
      card: "When Card is Held in Hand", 
    },
    description: {
      joker: "Triggers for each individual card currently held in your hand. Perfect for effects that scale with specific cards you're holding, like gaining money for each Ace or mult for each face card.",
      card: "Triggers when this card is in the player's hand",
    },    
    category: "Hand Scoring",
    objectUsers: ["joker", "card"],
  },
  {
    id: "card_held_in_hand_end_of_round",
    label: {
      joker: "When a Card is Held in Hand at End of Round",
      card: "When Card is Held in Hand at End of Round", 
    },
    description: {
      joker: "Triggers for each individual card currently held in your hand at the end of the round. Good for effects that mimic Gold Cards or Blue Seals.",
      card: "Triggers when this card is in the player's hand at the end of the round",
    },    
    category: "In Blind Events",
    objectUsers: ["joker", "card"],
  },
  {
    id: "playing_card_added",
    label: {
      joker: "When Playing Card is Added",
    },
    description: {
      joker: "Triggers when playing cards are added to your deck. Perfect for effects that scale with deck size or trigger when specific cards are acquired, like Hologram gaining X Mult when cards are added.",
    },    
    category: "Packs & Consumables",
    objectUsers: ["joker"],
  },
  {
    id: "before_hand_played",
    label: {
      joker: "Before Hand Starts Scoring",
    },
    description: {
      joker: "Triggers before a hand starts the scoring sequence or any jokers have been calculated. Perfect for scaling jokers or effects that should happen once per hand before everything else.",
    },    
    category: "Hand Scoring",
    objectUsers: ["joker"],
  },
  {
    id: "joker_evaluated",
    label: {
      joker: "When Another Joker is Evaluated",
    },
    description: {
      joker: "Triggers when another joker you own is evaluated (triggered after scoring).",
    },    
    category: "Hand Scoring",
    objectUsers: ["joker"],
  },
  {
    id: "joker_triggered",
    label: {
      joker: "When Another Joker is Triggered",
    },
    description: {
      joker: "Triggers when another joker's effect Triggered",
    },    
    category: "Hand Scoring",
    objectUsers: ["joker"],
  },
  {
    id: "after_hand_played",
    label: {
      joker: "When Hand Finishes Scoring",
    },
    description: {
      joker: "Triggers after a hand has completely finished scoring, after all cards have been scored and all joker effects have been calculated. Perfect for cleanup effects, resetting variables, or effects that should happen once per hand after everything else.",
    },    
    category: "Hand Scoring",
    objectUsers: ["joker"],
  },
  {
    id: "round_end",
    label: {
      joker: "When the Round Ends",
      voucher: "When the Round Ends",
      deck: "When the Round Ends",
    },
    description: {
      joker: "Triggers at the end of each round, after all hands have been played and the blind is completed. Perfect for gaining money, upgrading the joker, or resetting states.",
      voucher: "Triggers at the end of each round, after all hands have been played and the blind is completed. Perfect for gaining money, upgrading the joker, or resetting states.",
      deck: "Triggers at the end of each round, after all hands have been played and the blind is completed. Perfect for gaining money, upgrading the joker, or resetting states.",    
    },    
    category: "In Blind Events",
    objectUsers: ["joker", "voucher", "deck"],
  },
  {
    id: "blind_selected",
    label: {
      joker: "When a Blind is Selected",
      voucher: "When a Blind is Selected",
      deck: "When a Blind is Selected",
    },
    description: {
      joker: "Triggers when the player selects a new blind at the start of each ante.",
      voucher: "Triggers when the player selects a new blind at the start of each ante.",
      deck: "Triggers when the player selects a new blind at the start of each ante.",    
    },    
    category: "Round Events",
    objectUsers: ["joker", "voucher", "deck"],
  },
  {
    id: "blind_skipped",
    label: {
      joker: "When a Blind is Skipped",
      voucher: "When a Blind is Skipped",
      deck: "When a Blind is Skipped",
    },
    description: {
      joker: "Triggers when the player chooses to skip a blind.",
      voucher: "Triggers when the player chooses to skip a blind.",
      deck: "Triggers when the player chooses to skip a blind.",    
    },    
    category: "Round Events",
    objectUsers: ["joker", "voucher", "deck"],
  },
  {
    id: "blind_disabled",
    label: {
      joker: "When Blind is Disable",
      voucher: "When Blind is Disable",
      deck: "When Blind is Disable",
    },
    description: {
      joker: "Triggers when the blind is Disabled by the player.",
      voucher: "Triggers when the blind is Disabled by the player.",
      deck: "Triggers when the blind is Disabled by the player.",    
    },    
    category: "In Blind Events",
    objectUsers: ["joker", "voucher", "deck"],
  },
  {
    id: "boss_defeated",
    label: {
      joker: "When a Boss is Defeated",
      voucher: "When a Boss is Defeated",
      deck: "When a Boss is Defeated",
    },
    description: {
      joker: "Triggers after defeating a boss blind",
      voucher: "Triggers after defeating a boss blind",
      deck: "Triggers after defeating a boss blind",    
    },    
    category: "Round Events",
    objectUsers: ["joker", "voucher", "deck"],
  },
  {
    id: "booster_opened",
    label: {
      joker: "When a Booster Pack is Opened",
      voucher: "When a Booster Pack is Opened",
      deck: "When a Booster Pack is Opened",
    },
    description: {
      joker: "Triggers when the player opens a booster pack",
      voucher: "Triggers when the player opens a booster pack",
      deck: "Triggers when the player opens a booster pack",    
    },    
    category: "Packs & Consumables",
    objectUsers: ["joker", "voucher", "deck"],
  },
  {
    id: "booster_skipped",
    label: {
      joker: "When a Booster Pack is Skipped",
      voucher: "When a Booster Pack is Skipped",
      deck: "When a Booster Pack is Skipped",
    },
    description: {
      joker: "Triggers when the player chooses to skip a booster pack",
      voucher: "Triggers when the player chooses to skip a booster pack",
      deck: "Triggers when the player chooses to skip a booster pack",    
    },    
    category: "Packs & Consumables",
    objectUsers: ["joker", "voucher", "deck"],
  },
  {
    id: "booster_exited",
    label: {
      joker: "When a Booster Pack is Exited",
    },
    description: {
      joker: "Triggers when the player chooses exits a booster pack",   
    },    
    category: "Packs & Consumables",
    objectUsers: ["joker"],
  },
  {
    id: "shop_entered",
    label: {
      joker: "When Shop is Entered",
      voucher: "When Shop is Entered",
      deck: "When Shop is Entered",
    },
    description: {
      joker: "Triggers when the player enters the shop",
      voucher: "Triggers when the player enters the shop",
      deck: "Triggers when the player enters the shop",    
    },    
    category: "Round Events",
    objectUsers: ["joker", "voucher", "deck"],
  },
  {
    id: "shop_exited",
    label: {
      joker: "When Shop is Exited",
      voucher: "When Shop is Exited",
      deck: "When Shop is Exited",
    },
    description: {
      joker: "Triggers when the player exits the shop",
      voucher: "Triggers when the player exits the shop",
      deck: "Triggers when the player exits the shop",    
    },    
    category: "Round Events",
    objectUsers: ["joker", "voucher", "deck"],
  },
  {
    id: "tag_added",
    label: {
      joker: "When a Tag is Added",     
    },
    description: {
      joker: "Triggers when you obtain a Tag",
    },    
    category: "Round Events",
    objectUsers: ["joker"],
  },
  {
    id: "selling_self",
    label: {
      joker: "When This Card is Sold",      
    },
    description: {
      joker: "Triggers when this specific joker is sold",
    },    
    category: "Economy",
    objectUsers: ["joker"],
  },
  {
    id: "card_sold",
    label: {
      joker: "When a Card is Sold",   
    },
    description: {
      joker: "Triggers when any card is sold from your collection or the shop",
    },    
    category: "Economy",
    objectUsers: ["joker"],
  },
  {
    id: "buying_self",
    label: {
      joker: "When This Card is Bought",   
    },
    description: {
      joker: "Triggers when this specific joker is bought",
    },    
    category: "Economy",
    objectUsers: ["joker"],
  },
  {
    id: "card_bought",
    label: {
      joker: "When a Card is Bought", 
    },
    description: {
      joker: "Triggers when any card is bought from the shop",
    },    
    category: "Economy",
    objectUsers: ["joker"],
  },
  {
    id: "shop_reroll",
    label: {
      joker: "When Shop is Rerolled",      
    },
    description: {
      joker: "riggers whenever the player rerolls the shop to get new items. Perfect for gaining benefits from spending money or building up values through shop interaction",
    },    
    category: "Economy",
    objectUsers: ["joker"],
  },  
  {
    id: "consumable_used",
    label: {
      joker: "When a Consumable is Used",
    },
    description: {
      joker: "Triggers when the player uses a Tarot, Planet, or Spectral card",
    },    
    category: "Packs & Consumables",
    objectUsers: ["joker"],
  },
  {
    id: "player_action",
    label: {
      joker: "When the Player Does Any Action",
    },
    description: {
      joker: "Activates whenever the player performs any ingame action",
    },    
    category: "Special",
    objectUsers: ["joker"],
  },
  {
    id: "game_over",
    label: {
      joker: "When Game Over",
    },
    description: {
      joker: "Triggers when the player would lose the run (game over condition). Perfect for implementing 'save on death' mechanics like Mr. Bones, or effects that should happen when a run ends unsuccessfully",
    },    
    category: "Special",
    objectUsers: ["joker"],
  },
  {
    id: "ante_start",
    label: {
      joker: "At the Start of an Ante",
    },
    description: {
      joker: "Triggers At the start of an ante",
    },    
    category: "Round Events",
    objectUsers: ["joker"],
  },
  {
    id: "change_probability",
    label: {
      joker: "Change Probability",
    },
    description: {
      joker: "Change Probability in any way",
    },    
    category: "Special",
    objectUsers: ["joker"],
  },
  {
    id: "probability_result",
    label: {
      joker: "Probability Result",
    },
    description: {
      joker: "Check if probability succeeds or fails (look at the probability category in conditions)",
    },    
    category: "Special",
    objectUsers: ["joker"],
  },
  {
    id: "passive",
    label: {
      joker: "Passive (Always Active)",
    },
    description: {
      joker: "Permanent effects that modify game rules or state while the joker is in play",
    },    
    category: "Special",
    objectUsers: ["joker"],
  },
]

export function getTriggerById(id: string): GlobalTriggerDefinition | undefined {
  return TRIGGERS.find((trigger) => trigger.id === id);
}

export function getTriggers(itemType: string): GlobalTriggerDefinition[] {
  if (itemType === "edition" || itemType === "enhancement" || itemType === "seal") {
    itemType = "card"
  }
  return TRIGGERS.filter((trigger) => trigger.objectUsers.includes(itemType));
}