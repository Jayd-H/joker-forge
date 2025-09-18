import { TriggerDefinition } from "../../ruleBuilder/types";
import {
  PlayIcon,
  ClockIcon,
  BanknotesIcon,
  RectangleStackIcon,
  ShoppingCartIcon,
  SparklesIcon,
  HandRaisedIcon,
} from "@heroicons/react/24/outline";

export interface CategoryDefinition {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const TRIGGER_CATEGORIES: CategoryDefinition[] = [
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

export const TRIGGERS: TriggerDefinition[] = [
  {
    id: "hand_played",
    label: "When a Hand is Played",
    description:
      "Triggers when any hand is played. Use conditions to specify whether to check scoring cards, all played cards, or specific hand types.",
    category: "Hand Scoring",
  },
  {
    id: "card_scored",
    label: "When a Card is Scored",
    description:
      "Triggers for each individual card during scoring. Use this for card-specific properties like suit, rank, or enhancements.",
    category: "Hand Scoring",
  },
  {
    id: "card_destroyed",
    label: "When a Card is Destroyed",
    description:
      "Triggers when cards are destroyed (e.g. by Glass Cards breaking, being eaten by jokers, sacrificed by consumables).",
    category: "Special",
  },
  {
    id: "first_hand_drawn",
    label: "When First Hand is Drawn",
    description: "Triggers only for the first hand drawn in each round.",
    category: "In Blind Events",
  },
  {
    id: "hand_drawn",
    label: "When a Hand is Drawn",
    description: "Triggers when the player draws a new hand of cards.",
    category: "In Blind Events",
  },
  {
    id: "hand_discarded",
    label: "When a Hand is Discarded",
    description:
      "Triggers when the player discards a hand of cards (before the discard happens). Different from 'When a Card is Discarded' which triggers per individual card.",
    category: "In Blind Events",
  },
  {
    id: "card_discarded",
    label: "When a Card is Discarded",
    description:
      "Triggers whenever a card is discarded. Use conditions to check properties of the discarded card.",
    category: "In Blind Events",
  },
  {
    id: "card_held_in_hand",
    label: "When a Card is Held in Hand",
    description:
      "Triggers for each individual card currently held in your hand. Perfect for effects that scale with specific cards you're holding, like gaining money for each Ace or mult for each face card.",
    category: "Hand Scoring",
  },
  {
    id: "playing_card_added",
    label: "When Playing Card is Added",
    description:
      "Triggers when playing cards are added to your deck. Perfect for effects that scale with deck size or trigger when specific cards are acquired, like Hologram gaining X Mult when cards are added.",
    category: "Packs & Consumables",
  },
  {
    id: "card_held_in_hand_end_of_round",
    label: "When a Card is Held in Hand at End of Round",
    description:
      "Triggers for each individual card currently held in your hand at the end of the round. Good for effects that mimic Gold Cards or Blue Seals.",
    category: "In Blind Events",
  },
  {
    id: "before_hand_played",
    label: "Before Hand Starts Scoring",
    description:
      "Triggers before a hand starts the scoring sequence or any jokers have been calculated. Perfect for scaling jokers or effects that should happen once per hand before everything else.",
    category: "Hand Scoring",
  },
  {
    id: "joker_evaluated",
    label: "When Another Joker is Evaluated",
    description: "Triggers when another joker you own is evaluated (triggered after scoring).",
    category: "Hand Scoring"
  },
  {
    id: "after_hand_played",
    label: "When Hand Finishes Scoring",
    description:
      "Triggers after a hand has completely finished scoring, after all cards have been scored and all joker effects have been calculated. Perfect for cleanup effects, resetting variables, or effects that should happen once per hand after everything else.",
    category: "Hand Scoring",
  },
  {
    id: "round_end",
    label: "When the Round Ends",
    description:
      "Triggers at the end of each round, after all hands have been played and the blind is completed. Perfect for gaining money, upgrading the joker, or resetting states.",
    category: "In Blind Events",
  },
  {
    id: "blind_selected",
    label: "When a Blind is Selected",
    description:
      "Triggers when the player selects a new blind at the start of each ante.",
    category: "Round Events",
  },
  {
    id: "blind_skipped",
    label: "When a Blind is Skipped",
    description: "Triggers when the player chooses to skip a blind.",
    category: "Round Events",
  },
  {
    id: "boss_defeated",
    label: "When a Boss is Defeated",
    description: "Triggers after defeating a boss blind.",
    category: "Round Events",
  },
  {
    id: "tag_added",
    label: "When a Tag is Added",
    description: "Triggers when you obtain a Tag.",
    category: "Round Events",
  },
  {
    id: "selling_self",
    label: "When This Card is Sold",
    description: "Triggers when this specific joker is sold.",
    category: "Economy",
  },
  {
    id: "card_sold",
    label: "When a Card is Sold",
    description:
      "Triggers when any card is sold from your collection or the shop.",
    category: "Economy",
  },
  {
    id: "buying_self",
    label: "When This Card is Bought",
    description: "Triggers when this specific joker is bought.",
    category: "Economy",
  },
  {
    id: "card_bought",
    label: "When a Card is Bought",
    description: "Triggers when any card is bought from the shop.",
    category: "Economy",
  },
  {
    id: "booster_opened",
    label: "When a Booster is Opened",
    description: "Triggers when the player opens a booster pack.",
    category: "Packs & Consumables",
  },
  {
    id: "booster_skipped",
    label: "When a Booster is Skipped",
    description: "Triggers when the player chooses to skip a booster pack.",
    category: "Packs & Consumables",
  },
  {
    id: "shop_reroll",
    label: "When Shop is Rerolled",
    description:
      "Triggers whenever the player rerolls the shop to get new items. Perfect for gaining benefits from spending money or building up values through shop interaction.",
    category: "Economy",
  },
  {
    id: "consumable_used",
    label: "When a Consumable is Used",
    description:
      "Triggers when the player uses a Tarot, Planet, or Spectral card.",
    category: "Packs & Consumables",
  },
  {
    id: "shop_entered",
    label: "When Shop is Entered",
    description: "Triggers when the player enters the shop.",
    category: "Round Events",
  },
  {
    id: "shop_exited",
    label: "When Shop is Exited",
    description: "Triggers when the player exits the shop.",
    category: "Round Events",
  },
  {
    id: "game_over",
    label: "When Game Over",
    description:
      "Triggers when the player would lose the run (game over condition). Perfect for implementing 'save on death' mechanics like Mr. Bones, or effects that should happen when a run ends unsuccessfully.",
    category: "Special",
  },
  {
    id: "change_probability",
    label: "Change Probability",
    description:
      "Change Probability in any way",
    category: "Special",
  },
  {
    id: "probability_result",
    label: "Probability Result",
    description:
      "Check if probability succeeds or fails (look at the probability category in conditions)",
    category: "Special",
  },
  {
    id: "passive",
    label: "Passive (Always Active)",
    description:
      "Permanent effects that modify game rules or state while the joker is in play.",
    category: "Special",
  },
];

// Helper function to get a specific trigger by ID
export function getTriggerById(id: string): TriggerDefinition | undefined {
  return TRIGGERS.find((trigger) => trigger.id === id);
}
