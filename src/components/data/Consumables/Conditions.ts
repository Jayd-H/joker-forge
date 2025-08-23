import { ConditionTypeDefinition } from "../../ruleBuilder/types";
import {
  RectangleStackIcon,
  UserIcon,
  ArchiveBoxIcon,
  InformationCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { CategoryDefinition } from "../Jokers/Triggers";
import {
  COMPARISON_OPERATORS,
  CONSUMABLE_SETS,
  CUSTOM_CONSUMABLES,
  PLANET_CARDS,
  SPECTRAL_CARDS,
  TAROT_CARDS,
  VOUCHERS,
} from "../BalatroUtils";

export const CONSUMABLE_GENERIC_TRIGGERS: string[] = [
  "consumable_used",
  "card_selected",
  "hand_highlighted",
  "before_use",
  "after_use",
];

export const CONSUMABLE_CONDITION_CATEGORIES: CategoryDefinition[] = [
  {
    label: "Card Selection",
    icon: RectangleStackIcon,
  },
  {
    label: "Player State",
    icon: UserIcon,
  },
  {
    label: "Hand State",
    icon: ArchiveBoxIcon,
  },
  {
    label: "Game Context",
    icon: InformationCircleIcon,
  },
  {
    label: "Special",
    icon: SparklesIcon,
  },
];

export const CONSUMABLE_CONDITION_TYPES: ConditionTypeDefinition[] = [
  {
    id: "cards_selected",
    label: "Cards Selected",
    description: "Check how many cards are selected/highlighted",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: [
          { value: "equals", label: "equals" },
          { value: "greater_than", label: "greater than" },
          { value: "less_than", label: "less than" },
          { value: "greater_equals", label: "greater than or equal" },
          { value: "less_equals", label: "less than or equal" },
        ],
        default: "equals",
      },
      {
        id: "value",
        type: "number",
        label: "Number of Cards",
        default: 1,
        min: 0,
      },
    ],
    category: "Card Selection",
  },
  {
    id: "player_money",
    label: "Player Money",
    description: "Check the player's current money",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: [
          { value: "equals", label: "equals" },
          { value: "greater_than", label: "greater than" },
          { value: "less_than", label: "less than" },
          { value: "greater_equals", label: "greater than or equal" },
          { value: "less_equals", label: "less than or equal" },
        ],
        default: "greater_equals",
      },
      {
        id: "value",
        type: "number",
        label: "Dollar Amount",
        default: 5,
        min: 0,
      },
    ],
    category: "Player State",
  },
  {
    id: "ante_level",
    label: "Ante Level",
    description: "Check the current ante level",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: [
          { value: "equals", label: "equals" },
          { value: "not_equals", label: "not equals" },
          { value: "greater_than", label: "greater than" },
          { value: "less_than", label: "less than" },
          { value: "greater_equals", label: "greater than or equal" },
          { value: "less_equals", label: "less than or equal" },
        ],
        default: "greater_equals",
      },
      {
        id: "value",
        type: "number",
        label: "Ante Level",
        default: 1,
        min: 1,
      },
    ],
    category: "Game Context",
  },
  {
    id: "voucher_redeemed",
    label: "Voucher Redeemed",
    description: "Check if a specific Voucher was redeemed during the run",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "voucher",
        type: "select",
        label: "Voucher",
        options: [...VOUCHERS()],
        default: "v_overstock_norm",
      },
    ],
    category: "Game Context",
  },
  {
    id: "hand_size",
    label: "Hand Size",
    description: "Check the current hand size",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: [
          { value: "equals", label: "equals" },
          { value: "not_equals", label: "not equals" },
          { value: "greater_than", label: "greater than" },
          { value: "less_than", label: "less than" },
          { value: "greater_equals", label: "greater than or equal" },
          { value: "less_equals", label: "less than or equal" },
        ],
        default: "equals",
      },
      {
        id: "value",
        type: "number",
        label: "Hand Size",
        default: 8,
        min: 1,
      },
    ],
    category: "Player State",
  },
  {
    id: "remaining_hands",
    label: "Remaining Hands",
    description: "Check how many hands the player has left",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: [
          { value: "equals", label: "equals" },
          { value: "not_equals", label: "not equals" },
          { value: "greater_than", label: "greater than" },
          { value: "less_than", label: "less than" },
          { value: "greater_equals", label: "greater than or equal" },
          { value: "less_equals", label: "less than or equal" },
        ],
        default: "equals",
      },
      {
        id: "value",
        type: "number",
        label: "Number of Hands",
        default: 1,
        min: 0,
      },
    ],
    category: "Player State",
  },
  {
    id: "in_blind",
    label: "In Blind",
    description: "Check if the player is currently in a blind (gameplay)",
    applicableTriggers: ["consumable_used"],
    params: [],
    category: "Game Context",
  },
  {
    id: "consumable_count",
    label: "Consumable Count",
    description: "Check how many of a consumable a player has",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "consumable_type",
        type: "select",
        label: "Consumable Type",
        options: () => [
          { value: "any", label: "Any Consumable" },
          ...CONSUMABLE_SETS(),
        ],
        default: "any",
      },
      {
        id: "specific_card",
        type: "select",
        label: "Specific Card",
        options: (parentValues: Record<string, unknown>) => {
          const selectedSet = parentValues?.consumable_type as string;

          if (!selectedSet || selectedSet === "any") {
            return [];
          }

          // Handle vanilla sets
          if (selectedSet === "Tarot") {
            const vanillaCards = TAROT_CARDS.map((card) => ({
              value: card.key,
              label: card.label,
            }));

            const customCards = CUSTOM_CONSUMABLES()
              .filter((consumable) => consumable.set === "Tarot")
              .map((consumable) => ({
                value: consumable.value,
                label: consumable.label,
              }));

            return [
              { value: "any", label: "Any from Set" },
              ...vanillaCards,
              ...customCards,
            ];
          }

          if (selectedSet === "Planet") {
            const vanillaCards = PLANET_CARDS.map((card) => ({
              value: card.key,
              label: card.label,
            }));

            const customCards = CUSTOM_CONSUMABLES()
              .filter((consumable) => consumable.set === "Planet")
              .map((consumable) => ({
                value: consumable.value,
                label: consumable.label,
              }));

            return [
              { value: "any", label: "Any from Set" },
              ...vanillaCards,
              ...customCards,
            ];
          }

          if (selectedSet === "Spectral") {
            const vanillaCards = SPECTRAL_CARDS.map((card) => ({
              value: card.key,
              label: card.label,
            }));

            const customCards = CUSTOM_CONSUMABLES()
              .filter((consumable) => consumable.set === "Spectral")
              .map((consumable) => ({
                value: consumable.value,
                label: consumable.label,
              }));

            return [
              { value: "any", label: "Any from Set" },
              ...vanillaCards,
              ...customCards,
            ];
          }

          // Handle custom sets
          const setKey = selectedSet.includes("_")
            ? selectedSet.split("_").slice(1).join("_")
            : selectedSet;

          const customConsumablesInSet = CUSTOM_CONSUMABLES().filter(
            (consumable) =>
              consumable.set === setKey || consumable.set === selectedSet
          );

          return [
            { value: "any", label: "Any from Set" },
            ...customConsumablesInSet,
          ];
        },
        default: "any",
      },
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: [...COMPARISON_OPERATORS],
      },
      {
        id: "value",
        type: "number",
        label: "Number of Consumables",
        min: 0,
        default: 1,
      },
    ],
    category: "Player State",
  },
  {
    id: "check_flag",
    label: "Check Flag",
    description: "Check if a specific flag from your mod is true",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "flag_name",
        type: "text",
        label: "Flag Name",
        default: "custom_flag",
      },
    ],
    category: "Special",
  },
];

export function getConsumableConditionsForTrigger(
  triggerId: string
): ConditionTypeDefinition[] {
  return CONSUMABLE_CONDITION_TYPES.filter((condition) =>
    condition.applicableTriggers?.includes(triggerId)
  );
}

export function getConsumableConditionTypeById(
  id: string
): ConditionTypeDefinition | undefined {
  return CONSUMABLE_CONDITION_TYPES.find((condition) => condition.id === id);
}
