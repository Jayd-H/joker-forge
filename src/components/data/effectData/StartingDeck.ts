import { GlobalEffectTypeDefinition } from "../../ruleBuilder/types";
import { EDITIONS, ENHANCEMENTS, RANKS, SEALS, SUITS } from "../BalatroUtils";

export const STARTING_DECK_EFFECTS: GlobalEffectTypeDefinition[] = [
  {
    id: "edit_starting_dollars",
    label: "Edit Starting Dollars",
    description: "Add, subtract, or set the player's Starting money",
    objectUsers: ["deck"],
    applicableTriggers: ["deck_selected"],
    params: [
      {
        id: "operation",
        type: "select",
        label: "Operation",
        options: [
          { value: "add", label: "Add" },
          { value: "subtract", label: "Subtract" },
          { value: "set", label: "Set" },
        ],
        default: "add",
      },
      {
        id: "value",
        type: "number",
        label: "Dollar Amount",
        default: 5,
        min: 0,
      },
    ],
    category: "Economy",
  },
  {
    id: "edit_all_starting_cards",
    label: "Edit All Starting Cards",
    description: "Apply multiple modifications to the starting cards in the deck (enhancement, seal, edition, suit, rank)",
    objectUsers: ["deck"],
    applicableTriggers: ["deck_selected"],
    params: [
      {
        id: "enhancement",
        type: "select",
        label: "Enhancement Type",
        options: () => [
          { value: "none", label: "No Change" },
          ...ENHANCEMENTS(),
          { value: "random", label: "Random Enhancement" },
        ],
        default: "none",
      },
      {
        id: "seal",
        type: "select",
        label: "Seal Type",
        options: () => [
          { value: "none", label: "No Change" },
          { value: "random", label: "Random Seal" },
          ...SEALS(),
        ],
        default: "none",
      },
      {
        id: "edition",
        type: "select",
        label: "Edition Type",
        options: [
          { value: "none", label: "No Change" },
          ...EDITIONS().map((edition) => ({
            value: edition.key,
            label: edition.label,
          })),
          { value: "random", label: "Random" },
        ],
        default: "none",
      },
      {
        id: "suit",
        type: "select",
        label: "Suit",
        options: [
          { value: "none", label: "No Change" },
          ...SUITS,
          { value: "random", label: "Random Suit" },
        ],
        default: "none",
      },
      {
        id: "rank",
        type: "select",
        label: "Rank",
        options: [
          { value: "none", label: "No Change" },
          ...RANKS.map((rank) => ({ value: rank.label, label: rank.label })),
          { value: "random", label: "Random Rank" },
        ],
        default: "none",
      },
    ],
    category: "Deck Card Modifications",
  },
  {
    id: "edit_starting_suits",
    label: "Edit Starting Suits",
    description: "Apply multiple modifications to the starting suits in the deck (enhancement, seal, edition, replace/delete suit)",
    objectUsers: ["deck"],
    applicableTriggers: ["deck_selected"],
    params: [
      {
        id: "selected_suit",
        type: "select",
        label: "Suit",
        options: [...SUITS],
        default: "Spades",
      },
      {
        id: "enhancement",
        type: "select",
        label: "Enhancement Type",
        options: () => [
          { value: "none", label: "No Change" },
          ...ENHANCEMENTS(),
          { value: "random", label: "Random Enhancement" },
        ],
        default: "none",
      },
      {
        id: "seal",
        type: "select",
        label: "Seal Type",
        options: () => [
          { value: "none", label: "No Change" },
          { value: "random", label: "Random Seal" },
          ...SEALS(),
        ],
        default: "none",
      },
      {
        id: "edition",
        type: "select",
        label: "Edition Type",
        options: [
          { value: "none", label: "No Change" },
          ...EDITIONS().map((edition) => ({
            value: edition.key,
            label: edition.label,
          })),
          { value: "random", label: "Random" },
        ],
        default: "none",
      },
      {
        id: "replace_suit",
        type: "select",
        label: "Suit Replacer/Deleter",
        options: [
          { value: "none", label: "No Change" },
          ...SUITS,
          { value: "random", label: "Random Suit" },
          { value: "remove", label: "Remove Suit" },
        ],
        default: "none",
      },
    ],
    category: "Deck Card Modifications",
  },
  {
    id: "edit_starting_ranks",
    label: "Edit Starting Ranks",
    description: "Apply multiple modifications to the starting ranks in the deck (enhancement, seal, edition, replace/delete rank)",
    objectUsers: ["deck"],
    applicableTriggers: ["deck_selected"],
    params: [
      {
        id: "specific_selected_Rank",
        type: "select",
        label: "Rank",
        options: [
          ...RANKS.map((rank) => ({ value: rank.label, label: rank.label })),
        ],
        default: "King",
      },
      {
        id: "enhancement",
        type: "select",
        label: "Enhancement Type",
        options: () => [
          { value: "none", label: "No Change" },
          ...ENHANCEMENTS(),
          { value: "random", label: "Random Enhancement" },
        ],
        default: "none",
      },
      {
        id: "seal",
        type: "select",
        label: "Seal Type",
        options: () => [
          { value: "none", label: "No Change" },
          { value: "random", label: "Random Seal" },
          ...SEALS(),
        ],
        default: "none",
      },
      {
        id: "edition",
        type: "select",
        label: "Edition Type",
        options: [
          { value: "none", label: "No Change" },
          ...EDITIONS().map((edition) => ({
            value: edition.key,
            label: edition.label,
          })),
          { value: "random", label: "Random" },
        ],
        default: "none",
      },
      {
        id: "specific_replace_Rank",
        type: "select",
        label: "Rank Replacer/Deleter",
        options: [
          { value: "none", label: "No Change" },
          ...RANKS.map((rank) => ({ value: rank.label, label: rank.label })),
          { value: "random", label: "Random Rank" },
          { value: "remove", label: "Remove Rank" },
        ],
        default: "none",
      },
    ],
    category: "Deck Card Modifications",
  },
  {
    id: "add_starting_cards",
    label: "Add Starting Cards",
    description: "Create and add new starting cards to the deck with specified properties",
      objectUsers: ["deck"],
    applicableTriggers: ["deck_selected"],
    params: [
      {
        id: "count",
        type: "number",
        label: "Number of Cards",
        default: 1,
        min: 1,
        max: 8,
      },
      {
        id: "rank",
        type: "select",
        label: "Rank",
        options: [
          { value: "random", label: "Random Rank" },
          { value: "Face Cards", label: "Face Cards" },
          { value: "Numbered Cards", label: "Numbered Cards" },
          { value: "pool", label: "Random from pool" },
          ...RANKS.map((rank) => ({ value: rank.label, label: rank.label })),
        ],
        default: "random",
      },
      {
        id: "rank_pool",
        type: "checkbox",
        label: "Possible Ranks",
        checkboxOptions: [...RANKS],
        showWhen: {
          parameter: "rank",
          values: ["pool"],
        },
      },
      {
        id: "suit",
        type: "select",
        label: "Suit",
        options: [
          { value: "none", label: "Random Suit" },
          { value: "pool", label: "Random from pool" },
          ...SUITS,
        ],
        default: "none",
      },
      {
        id: "suit_pool",
        type: "checkbox",
        label: "Possible Suits",
        checkboxOptions: [...SUITS],
        showWhen: {
          parameter: "suit",
          values: ["pool"],
        },
      },
      {
        id: "enhancement",
        type: "select",
        label: "Enhancement Type",
        options: () => [
          { value: "none", label: "No Enhancement" },
          ...ENHANCEMENTS(),
          { value: "random", label: "Random Enhancement" },
        ],
        default: "none",
      },
      {
        id: "seal",
        type: "select",
        label: "Seal Type",
        options: () => [
          { value: "none", label: "No Seal" },
          { value: "random", label: "Random Seal" },
          ...SEALS(),
        ],
        default: "none",
      },
      {
        id: "edition",
        type: "select",
        label: "Edition Type",
        options: [
          { value: "none", label: "No Edition" },
          ...EDITIONS().map((edition) => ({
            value: edition.key,
            label: edition.label,
          })),
          { value: "random", label: "Random" },
        ],
        default: "none",
      },
    ],
    category: "Deck Card Modifications",
  },
  {
    id: "remove_starting_cards",
    label: "Remove Starting Cards",
    description: "Destroy a number of Starting cards from deck",
    objectUsers: ["deck"],
    applicableTriggers: ["deck_selected"],
    params: [
      {
        id: "remove_type",
        type: "select",
        label: "Remove Type",
        options: [
          { value: "all", label: "All Cards" },
          { value: "random", label: "Random Cards" },
        ],
        default: "all",
      },
      {
        id: "count",
        type: "number",
        label: "Number of Cards",
        showWhen: {
          parameter: "remove_type",
          values: ["random"],
        },
        default: 52,
        min: 1,
        max: 8,
      },
    ],
    category: "Deck Card Modifications",
  },
]