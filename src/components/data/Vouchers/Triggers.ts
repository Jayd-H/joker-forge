import { TriggerDefinition } from "../../ruleBuilder/types";
import { HandRaisedIcon } from "@heroicons/react/24/outline";

export interface CategoryDefinition {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const VOUCHER_TRIGGER_CATEGORIES: CategoryDefinition[] = [
  {
    label: "Usage",
    icon: HandRaisedIcon,
  },
];

export const VOUCHER_TRIGGERS: TriggerDefinition[] = [
  {
    id: "voucher_used",
    label: "When Voucher is Redeemed",
    description: "Triggers when this voucher is activated by the player",
    category: "Usage",
  },
];

export function getVoucherTriggerById(
  id: string
): TriggerDefinition | undefined {
  return VOUCHER_TRIGGERS.find((trigger) => trigger.id === id);
}
