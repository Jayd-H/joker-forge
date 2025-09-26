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
  EDITIONS,
  ENHANCEMENTS,
  PLANET_CARDS,
  RANKS,
  RARITIES,
  SEALS,
  SPECTRAL_CARDS,
  STICKERS,
  SUIT_GROUPS,
  SUITS,
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
    label: "Deck & Jokers",
    icon: ArchiveBoxIcon,
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
    id: "joker_selected",
    label: "Joker Selected",
    description: "Check if a joker is selected/highlighted",
    applicableTriggers: ["consumable_used"],
    params: [],
    category: "Card Selection",
  },
  {
      id: "deck_size",
      label: "Deck Size",
      description: "Check the size of the deck",
      applicableTriggers: ["consumable_used"],
      params: [
        {
          id: "size_type",
          type: "select",
          label: "Size Type",
          options: [
            { value: "remaining", label: "Remaining in Deck" },
            { value: "total", label: "Total Deck Size" },
          ],
          default: "remaining",
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
          label: "Number of Cards",
          default: 52,
        },
      ],
      category: "Deck & Jokers",
    },
  {
      id: "specific_joker",
      label: "Specific Joker",
      description: "Check if a specific joker is in your collection",
      applicableTriggers: ["consumable_used"],
      params: [
        {
          id: "operator",
          type: "select",
          label: "Condition",
          options: [
            { value: "has", label: "Has this joker" },
            { value: "does_not_have", label: "Does not have this joker" },
          ],
          default: "has",
        },
        {
          id: "joker_key",
          type: "text",
          label: "Joker Key (e.g., j_joker, j_greedy_joker, or just joker)",
          default: "j_joker",
        },
      ],
      category: "Deck & Jokers",
    },
  {
      id: "joker_count",
      label: "Joker Count",
      description: "Check how many jokers the player has",
      applicableTriggers: ["consumable_used"],
      params: [
        {
          id: "operator",
          type: "select",
          label: "Operator",
          options: [...COMPARISON_OPERATORS],
        },
        {
          id: "rarity",
          type: "select",
          label: "Rarity",
          options: () => [{ value: "any", label: "Any Rarity" }, ...RARITIES()],
          default: "any",
        },
        {
          id: "value",
          type: "number",
          label: "Number of Jokers",
          min: 0,
          default: 1,
        },
      ],
      category: "Deck & Jokers",
    },
  {
      id: "deck_count",
      label: "Deck Count",
      description: "Count cards in your entire deck by property",
      applicableTriggers: ["consumable_used"],
      params: [
        {
          id: "property_type",
          type: "select",
          label: "Property Type",
          options: [
            { value: "rank", label: "Rank" },
            { value: "suit", label: "Suit" },
            { value: "enhancement", label: "Enhancement" },
            { value: "seal", label: "Seal" },
            { value: "edition", label: "Edition" },
          ],
          default: "enhancement",
        },
        {
          id: "rank",
          type: "select",
          label: "Rank",
          options: [{ value: "any", label: "Any Rank" }, ...RANKS],
          showWhen: {
            parameter: "property_type",
            values: ["rank"],
          },
        },
        {
          id: "suit",
          type: "select",
          label: "Suit",
          options: [
            { value: "any", label: "Any Suit" },
            ...SUIT_GROUPS,
            ...SUITS,
          ],
          showWhen: {
            parameter: "property_type",
            values: ["suit"],
          },
        },
        {
          id: "enhancement",
          type: "select",
          label: "Enhancement",
          options: () => [
            { value: "any", label: "Any Enhancement" },
            { value: "none", label: "No Enhancement" },
            ...ENHANCEMENTS(),
          ],
          showWhen: {
            parameter: "property_type",
            values: ["enhancement"],
          },
        },
        {
          id: "seal",
          type: "select",
          label: "Seal",
          options: () => [
            { value: "any", label: "Any Seal" },
            { value: "none", label: "No Seal" },
            ...SEALS(),
          ],
          showWhen: {
            parameter: "property_type",
            values: ["seal"],
          },
        },
        {
          id: "edition",
          type: "select",
          label: "Edition",
          options: [
            { value: "any", label: "Any Edition" },
            { value: "none", label: "No Edition" },
            ...EDITIONS(),
          ],
          showWhen: {
            parameter: "property_type",
            values: ["edition"],
          },
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
          label: "Count",
          default: 1,
        },
      ],
      category: "Deck & Jokers",
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
    id: "joker_flipped",
    label: "Joker is Flipped",
    description: "Check if the selected joker is flipped (facing back)",
    applicableTriggers: ["consumable_used"],
    params: [],
    category: "Deck & Jokers",
  },
  {
      id: "joker_sticker",
      label: "Joker Sticker",
      description: "Check the stickers of the selected joker",
      applicableTriggers: ["consumable_used"],
      params: [
        {
          id: "sticker",
          type: "select",
          label: "Sticker",
          options: [...STICKERS.map(({ value, label }) => ({ value, label }))],
          default: "eternal",
        },
      ],
      category: "Deck & Jokers",
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
    id: "check_blind_requirements",
    label: "Blind Requirements",
    description:
      "Check what percentage of the blind requirement the current base hand score represents (e.g., 110% means you've exceeded the blind by 10%, values over 100% check if you've exceeded the blind)",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: [...COMPARISON_OPERATORS],
        default: "greater_equals",
      },
      {
        id: "percentage",
        type: "number",
        label: "Percentage (%)",
        default: 25,
      },
    ],
    category: "Game Context",
  },
  {
    id: "blind_name",
    label: "Blind Name",
    description: "Check the current blind",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "operation",
        type: "select",
        label: "Mode",
        options: [
          { value: "equals", label: "Equals" },
          { value: "not_equals", label: "Not Equals" },
        ],
        default: "equals",
      },
      {
        id: "value",
        type: "select",
        label: "Blind",
        options: [
          { value: "Small Blind", label: "Small Blind" },
          { value: "Big Blind", label: "Big Blind" },
          { value: "The Hook", label: "The Hook" },
          { value: "The Ox", label: "The Ox" },
          { value: "The House", label: "The House" },
          { value: "The Wall", label: "The Wall" },
          { value: "The Wheel", label: "The Wheel" },
          { value: "The Arm", label: "The Arm" },
          { value: "The Club", label: "The Club" },
          { value: "The Fish", label: "The Fish" },
          { value: "The Psychic", label: "The Psychic" },
          { value: "The Goad", label: "The Goad" },
          { value: "The Water", label: "The Water" },
          { value: "The Window", label: "The Window" },
          { value: "The Manacle", label: "The Manacle" },
          { value: "The Eye", label: "The Eye" },
          { value: "The Mouth", label: "The Mouth" },
          { value: "The Plant", label: "The Plant" },
          { value: "The Serpent", label: "The Serpent" },
          { value: "The Pillar", label: "The Pillar" },
          { value: "The Needle", label: "The Needle" },
          { value: "The Head", label: "The Head" },
          { value: "The Tooth", label: "The Tooth" },
          { value: "The Flint", label: "The Flint" },
          { value: "The Mark", label: "The Mark" },
          { value: "Amber Acorn", label: "Amber Acorn" },
          { value: "Verdant Leaf", label: "Verdant Leaf" },
          { value: "Violet Vessel", label: "Violet Vessel" },
          { value: "Crimson Heart", label: "Crimson Heart" },
          { value: "Cerulean Bell", label: "Cerulean Bell" },
        ],
        default: "Small Blind",
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
      id: "blind_type",
      label: "Blind Type",
      description: "Check the type of the current blind",
      applicableTriggers: ["consumable_used"],
      params: [
        {
          id: "blind_type",
          type: "select",
          label: "Blind Type",
          options: [
            { value: "small", label: "Small Blind" },
            { value: "big", label: "Big Blind" },
            { value: "boss", label: "Boss Blind" },
          ],
        },
      ],
      category: "Game Context",
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
    id: "system_condition",
    label: "Player OS",
    description: "Check on what Operating System the player is on",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "system",
        type: "select",
        label: "OS",
        options: [
          {value: "Windows",label: "Windows"},
          {value: "OS X",label: "OS X"},
          {value: "Linux",label: "Linux"},
          {value: "Android",label: "Android"},
          {value: "iOS",label: "iOS"},
        ],
        default: "Windows",
      },
    ],
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
