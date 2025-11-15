import { TriggerDefinition } from "../../../ruleBuilder/types";
import { HandRaisedIcon, PlayIcon } from "@heroicons/react/24/outline";

export interface CategoryDefinition {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CONSUMABLE_TRIGGER_CATEGORIES: CategoryDefinition[] = [
  {
    label: "Usage",
    icon: HandRaisedIcon,
  },
  {
    label: "In Blind Events",
    icon: PlayIcon,
  },
];

export const CONSUMABLE_TRIGGERS: TriggerDefinition[] = [
  {
    id: "consumable_used",
    label: "When Consumable is Used",
    description: "Triggers when this consumable is activated by the player",
    category: "Usage",
  },
  //{
  //  id: "held_hand",
  //  label: "While Consumable Held in Hand",
  //  description: "Triggers when this consumable is held in hand in a blind",
  //  category: "In Blind Events",
  //},
];

export function getConsumableTriggerById(
  id: string
): TriggerDefinition | undefined {
  return CONSUMABLE_TRIGGERS.find((trigger) => trigger.id === id);
}
