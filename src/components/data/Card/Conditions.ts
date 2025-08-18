import { ConditionTypeDefinition } from "../../ruleBuilder/types";
import {
  UserIcon,
  InformationCircleIcon,
  IdentificationIcon,
  ArchiveBoxIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { CategoryDefinition } from "../Jokers/Triggers";
import {
  RANKS,
  RANK_GROUPS,
  SUITS,
  SUIT_GROUPS,
  COMPARISON_OPERATORS,
  POKER_HANDS,
  EDITIONS,
  SEALS,
  RARITIES,
  VOUCHERS,
} from "../../data/BalatroUtils";
import { GENERIC_TRIGGERS } from "./Triggers";

export const CARD_GENERIC_TRIGGERS: string[] = ["card_scored", "card_held"];

export const CARD_CONDITION_CATEGORIES: CategoryDefinition[] = [
  {
    label: "Player State",
    icon: UserIcon,
  },
  {
    label: "Game Context",
    icon: InformationCircleIcon,
  },
  {
    label: "Card",
    icon: IdentificationIcon,
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

export const CARD_CONDITION_TYPES: ConditionTypeDefinition[] = [
  {
    id: "player_money",
    label: "Player Money",
    description: "Check the player's current money",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: [...COMPARISON_OPERATORS],
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
    id: "card_rank",
    label: "Card Rank",
    description: "Check the rank of the card",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "rank_type",
        type: "select",
        label: "Rank Type",
        options: [
          { value: "specific", label: "Specific Rank" },
          { value: "group", label: "Rank Group" },
        ],
      },
      {
        id: "specific_rank",
        type: "select",
        label: "Rank",
        options: [...RANKS],
        showWhen: {
          parameter: "rank_type",
          values: ["specific"],
        },
      },
      {
        id: "rank_group",
        type: "select",
        label: "Rank Group",
        options: [...RANK_GROUPS],
        showWhen: {
          parameter: "rank_type",
          values: ["group"],
        },
      },
    ],
    category: "Card",
  },
  {
    id: "card_suit",
    label: "Card Suit",
    description: "Check the suit of the card",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "suit_type",
        type: "select",
        label: "Suit Type",
        options: [
          { value: "specific", label: "Specific Suit" },
          { value: "group", label: "Suit Group" },
        ],
      },
      {
        id: "specific_suit",
        type: "select",
        label: "Suit",
        options: [...SUITS],
        showWhen: {
          parameter: "suit_type",
          values: ["specific"],
        },
      },
      {
        id: "suit_group",
        type: "select",
        label: "Suit Group",
        options: [...SUIT_GROUPS],
        showWhen: {
          parameter: "suit_type",
          values: ["group"],
        },
      },
    ],
    category: "Card",
  },
  {
    id: "card_edition",
    label: "Card Edition",
    description: "Check if the card has a specific edition",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "edition",
        type: "select",
        label: "Edition Type",
        options: [
          { value: "any", label: "Any Edition" },
          { value: "none", label: "No Edition" },
          ...EDITIONS,
        ],
      },
    ],
    category: "Card",
  },
  {
    id: "card_seal",
    label: "Card Seal",
    description: "Check if the card has a specific seal",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "seal",
        type: "select",
        label: "Seal Type",
        options: () => [{ value: "any", label: "Any Seal" }, ...SEALS()],
      },
    ],
    category: "Card",
  },
  {
    id: "card_index",
    label: "Card Index",
    description:
      "Check if the card is at a specific position in the scoring hand",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "index_type",
        type: "select",
        label: "Position Type",
        options: [
          { value: "number", label: "Specific Number" },
          { value: "first", label: "First Card" },
          { value: "last", label: "Last Card" },
        ],
        default: "first",
      },
      {
        id: "index_number",
        type: "number",
        label: "Position Number",
        default: 1,
        min: 1,
        showWhen: {
          parameter: "index_type",
          values: ["number"],
        },
      },
    ],
    category: "Card",
  },
  {
    id: "blind_type",
    label: "Blind Type",
    description: "Check the type of the current blind",
    applicableTriggers: GENERIC_TRIGGERS,
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
    id: "ante_level",
    label: "Ante Level",
    description: "Check the current ante level",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: [...COMPARISON_OPERATORS],
      },
      {
        id: "value",
        type: "number",
        label: "Ante Level",
        min: 1,
        default: 1,
      },
    ],
    category: "Game Context",
  },
  {
    id: "hand_size",
    label: "Hand Size",
    description: "Check the current hand size",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: [...COMPARISON_OPERATORS],
      },
      {
        id: "value",
        type: "number",
        label: "Hand Size",
        default: 8,
      },
    ],
    category: "Player State",
  },
  {
    id: "remaining_hands",
    label: "Remaining Hands",
    description: "Check how many hands the player has left",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: [...COMPARISON_OPERATORS],
      },
      {
        id: "value",
        type: "number",
        label: "Number of Hands",
        min: 0,
        default: 1,
      },
    ],
    category: "Player State",
  },
  {
    id: "remaining_discards",
    label: "Remaining Discards",
    description: "Check how many discards the player has left",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: [...COMPARISON_OPERATORS],
      },
      {
        id: "value",
        type: "number",
        label: "Number of Discards",
        min: 0,
        default: 1,
      },
    ],
    category: "Player State",
  },
  {
    id: "first_played_hand",
    label: "First Played Hand",
    description: "Check if this is the first hand played in the current round",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [],
    category: "Game Context",
  },
  {
    id: "poker_hand",
    label: "Poker Hand Type",
    description: "Check the type of poker hand being played",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: [
          { value: "equals", label: "equals" },
          { value: "not_equals", label: "not equals" },
        ],
      },
      {
        id: "value",
        type: "select",
        label: "Hand Type",
        options: [
          ...POKER_HANDS,
          { value: "most_played_hand", label: "Most Played Hand" },
          { value: "least_played_hand", label: "Least Played Hand" },
        ],
      },
    ],
    category: "Game Context",
  },
  {
    id: "hand_level",
    label: "Hand Level",
    description: "Check the level of a poker hand",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: [...COMPARISON_OPERATORS],
      },
      {
        id: "hand_selection",
        type: "select",
        label: "Hand Selection",
        options: [
          { value: "played", label: "Played Hand" },
          { value: "specific", label: "Specific Hand" },
          { value: "any", label: "Any Hand" },
        ],
        default: "any",
      },
      {
        id: "specific_hand",
        type: "select",
        label: "Specific Hand",
        options: [...POKER_HANDS],
        showWhen: {
          parameter: "hand_selection",
          values: ["specific"],
        },
      },
      {
        id: "value",
        type: "number",
        label: "Hand Level",
        min: 0,
        default: 1,
      },
    ],
    category: "Game Context",
  },
  {
    id: "blind_requirements",
    label: "Blind Requirements",
    description: "Check what percentage of the blind requirement is met",
    applicableTriggers: GENERIC_TRIGGERS,
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
    id: "joker_count",
    label: "Joker Count",
    description: "Check how many jokers the player has",
    applicableTriggers: GENERIC_TRIGGERS,
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
    id: "specific_joker",
    label: "Specific Joker",
    description: "Check if a specific joker is in your collection",
    applicableTriggers: GENERIC_TRIGGERS,
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
    id: "deck_size",
    label: "Deck Size",
    description: "Check the size of the deck",
    applicableTriggers: GENERIC_TRIGGERS,
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
    id: "voucher_redeemed",
    label: "Voucher Redeemed",
    description: "Check if a specific Voucher was redeemed during the run",
    applicableTriggers: GENERIC_TRIGGERS,
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
    id: "triggered_boss_blind",
    label: "Boss Blind Triggered",
    description: "Check if the current boss blind's effect has been triggered",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [],
    category: "Game Context",
  },
  {
    id: "internal_variable",
    label: "Internal Variable",
    description: "Check the value of an internal variable for this joker",
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [
      {
        id: "variable_name",
        type: "text",
        label: "Variable Name",
        default: "var1",
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
        label: "Value",
        default: 0,
      },
    ],
    category: "Special",
  },
];

export function getCardConditionsForTrigger(
  triggerId: string
): ConditionTypeDefinition[] {
  return CARD_CONDITION_TYPES.filter((condition) =>
    condition.applicableTriggers?.includes(triggerId)
  );
}

export function getCardConditionTypeById(
  id: string
): ConditionTypeDefinition | undefined {
  return CARD_CONDITION_TYPES.find((condition) => condition.id === id);
}
