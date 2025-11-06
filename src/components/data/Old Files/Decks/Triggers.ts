import { TriggerDefinition } from "../../ruleBuilder/types";
import { HandRaisedIcon, ClockIcon, RectangleStackIcon } from "@heroicons/react/24/outline";

export interface CategoryDefinition {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const DECK_TRIGGER_CATEGORIES: CategoryDefinition[] = [
  {
    label: "Selected",
    icon: HandRaisedIcon,
  },
  { 
    label: "Round Events",
    icon: ClockIcon,
  },
  {    
    label: "Packs & Consumables",
    icon: RectangleStackIcon,
  },
];

export const DECK_TRIGGERS: TriggerDefinition[] = [
  {
    id: "deck_selected",
    label: "When This Deck is Selected",
    description: "Triggers when this deck is activated by the player",
    category: "Selected",
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
    id: "round_end",
    label: "When the Round Ends",
    description:
      "Triggers at the end of each round, after all hands have been played and the blind is completed. Perfect for gaining money, upgrading the joker, or resetting states.",
    category: "Round Events",
  },
  {
    id: "boss_defeated",
    label: "When a Boss is Defeated",
    description: "Triggers after defeating a boss blind.",
    category: "Round Events",
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
];

export function getDeckTriggerById(
  id: string
): TriggerDefinition | undefined {
  return DECK_TRIGGERS.find((trigger) => trigger.id === id);
}
