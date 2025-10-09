import { TriggerDefinition } from "../../ruleBuilder/types";
import { HandRaisedIcon } from "@heroicons/react/24/outline";

export interface CategoryDefinition {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const DECK_TRIGGER_CATEGORIES: CategoryDefinition[] = [
  {
    label: "Selected",
    icon: HandRaisedIcon,
  },
];

export const DECK_TRIGGERS: TriggerDefinition[] = [
  {
    id: "deck_selected",
    label: "When This Deck is Selected",
    description: "Triggers when this deck is activated by the player",
    category: "Selected",
  },
];

export function getDeckTriggerById(
  id: string
): TriggerDefinition | undefined {
  return DECK_TRIGGERS.find((trigger) => trigger.id === id);
}
