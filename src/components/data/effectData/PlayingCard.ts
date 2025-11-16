import { GlobalEffectTypeDefinition } from "../../ruleBuilder/types";
import { EDITIONS, ENHANCEMENTS, RANKS, SEALS, SUITS } from "../BalatroUtils";
import { GENERIC_TRIGGERS } from "../Conditions";

export const PLAYING_CARD_EFFECTS: GlobalEffectTypeDefinition[] = [
  {
    id: "retrigger_cards",
    label: "Retrigger",
    description: "Retrigger the scored/activated card",
    objectUsers: ["joker", "card"],
    applicableTriggers: [
      "card_scored",
      "card_discarded",
      "card_held_in_hand",
      "card_held_in_hand_end_of_round",
    ],
    params: [
      {
        id: "repetitions",
        type: "number",
        label: "Repetitions",
        default: 1,
      },
    ],
    category: "Card Effects",
  },
  {
    id: "create_playing_card",
    label: "Create Playing Card",
    description: "Create a new playing card",
    applicableTriggers: [...GENERIC_TRIGGERS],
    objectUsers: ["joker"],
    params: [
      {
        id: "location",
        type: "select",
        label: "Where to Add Card to",
        options: [
          { value: "deck", label: "Add To Deck"},
          { value: "hand", label: "Add To Hand"},
        ],
        default: ["deck"]
      },
      {
        id: "suit",
        type: "select",
        label: "Suit",
        options: [{ value: "random", label: "Random" }, ...SUITS],
        default: "random",
        variableTypes: ["suit"],
      },
      {
        id: "rank",
        type: "select",
        label: "Rank",
        options: [{ value: "random", label: "Random" }, ...RANKS],
        default: "random",
        variableTypes: ["rank"],
      },
      {
        id: "variables",
        type: "checkbox",
        label: "Which types are Variables?",
        checkboxOptions: [
          { value: "A", label: "Enhancement"},
          { value: "B", label: "Seal"},
          { value: "C", label: "Edition"}
        ],
        default: [false, false, false],
        exemptObjects: ["card"]
      },
      {
        id: "enhancement",
        type: "select",
        label: "Enhancement",
        options: () => [
          { value: "none", label: "None" },
          { value: "random", label: "Random" },
          ...ENHANCEMENTS().map((enhancement) => ({
            value: enhancement.key,
            label: enhancement.label,
          })),
        ],
        default: "none",
        variableTypes: ["key"],
      },
      {
        id: "seal",
        type: "select",
        label: "Seal",
        options: () => [
          { value: "none", label: "None" },
          { value: "random", label: "Random" },
          ...SEALS().map((seal) => ({
            value: seal.key,
            label: seal.label,
          })),
        ],
        default: "none",
        variableTypes: ["key"],
      },
      {
        id: "edition",
        type: "select",
        label: "Edition",
        options: [
          { value: "none", label: "None" },
          { value: "random", label: "Random" },
          ...EDITIONS().map((edition) => ({
            value: edition.key,
            label: edition.label,
          })),
        ],
        default: "none",
        variableTypes: ["key"],
      },
    ],
    category: "Card Effects",
  },
  {
    id: "create_playing_cards",
    label: "Create Playing Cards",
    description: "Create and add new cards to hand with specified properties",
    objectUsers: ["consumable"],
    applicableTriggers: ["card_used", "held_hand"],
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
        }
      },
      {
        id: "suit",
        type: "select",
        label: "Suit",
        options: [
          { value: "none", label: "Random Suit" },
          { value: "pool", label: "Random from pool" },
          ...SUITS],
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
        }
      },
      {
        id: "enhancement",
        type: "select",
        label: "Enhancement Type",
        options: () => [
          { value: "none", label: "No Enhancement" },
          ...ENHANCEMENTS().map((enhancement) => ({
            value: enhancement.key,
            label: enhancement.label,
          })),
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
          ...SEALS().map((seal) => ({
            value: seal.key,
            label: seal.label,
          })),
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
          { value: "random", label: "Random Edition" },
        ],
        default: "none",
      },
    ],
    category: "Card Effects",
  },
  {
    id: "create_copy_triggered_card",
    label: "Copy Triggered Card",
    description: "Copy the card that triggered this effect",
    objectUsers: ["joker"],
    applicableTriggers: [
      "card_scored",
      "card_discarded",
      "card_held_in_hand",
      "card_held_in_hand_end_of_round",
    ],
    params: [
      {
        id: "add_to",
        type: "select",
        label: "Add to",
        options: [
          { value: "deck", label: "Deck" },
          { value: "hand", label: "Hand" },
        ],
        default: "deck",
      },
    ],
    category: "Card Effects",
  },
  {
    id: "create_copy_played_card",
    label: "Copy Played Card",
    description: "Copy a specific card from the played hand",
    objectUsers: ["joker"],
    applicableTriggers: ["hand_played"],
    params: [
      {
        id: "card_index",
        type: "select",
        label: "Position in Hand",
        options: [
          { value: "any", label: "Any Position" },
          { value: "1", label: "1st Card" },
          { value: "2", label: "2nd Card" },
          { value: "3", label: "3rd Card" },
          { value: "4", label: "4th Card" },
          { value: "5", label: "5th Card" },
        ],
        default: "any",
      },
      {
        id: "card_rank",
        type: "select",
        label: "Rank",
        options: [{ value: "any", label: "Any Rank" }, ...RANKS],
        default: "any",
        variableTypes: ["rank"],
      },
      {
        id: "card_suit",
        type: "select",
        label: "Suit",
        options: [{ value: "any", label: "Any Suit" }, ...SUITS],
        default: "any",
        variableTypes: ["suit"],
      },
      {
        id: "add_to",
        type: "select",
        label: "Add to",
        options: [
          { value: "deck", label: "Deck" },
          { value: "hand", label: "Hand" },
        ],
        default: "deck",
      },
    ],
    category: "Card Effects",
  },
  {
    id: "copy_selected_cards",
    label: "Copy Selected Cards",
    description: "Create copies of selected cards with customizable properties",
    objectUsers: ["consumable"],
    applicableTriggers: ["card_used"],
    params: [
      {
        id: "copies",
        type: "number",
        label: "Number of Copies per Card",
        default: 1,
        min: 1,
        max: 5,
      },
      {
        id: "enhancement",
        type: "select",
        label: "Enhancement Type",
        options: () => [
          { value: "none", label: "Keep Original Enhancement" },
          ...ENHANCEMENTS().map((enhancement) => ({
            value: enhancement.key,
            label: enhancement.label,
          })),
          { value: "random", label: "Random Enhancement" },
        ],
        default: "none",
      },
      {
        id: "seal",
        type: "select",
        label: "Seal Type",
        options: () => [
          { value: "none", label: "Keep Original Seal" },
          { value: "random", label: "Random Seal" },
          ...SEALS().map((seal) => ({
            value: seal.key,
            label: seal.label,
          })),
        ],
        default: "none",
      },
      {
        id: "edition",
        type: "select",
        label: "Edition Type",
        options: [
          { value: "none", label: "Keep Original Edition" },
          { value: "remove", label: "Remove Edition" },
          ...EDITIONS().map((edition) => ({
            value: edition.key,
            label: edition.label,
          })),
          { value: "random", label: "Random Edition" },
        ],
        default: "none",
      },
    ],
    category: "Card Effects",
  },
  {
    id: "edit_playing_card",
    label: "Edit Card",
    description: "Modify the properties of the card that triggered this effect",
    objectUsers: ["joker", "card"],
    applicableTriggers: [
      "card_scored",
      "card_discarded",
      "card_held_in_hand",
      "card_held_in_hand_end_of_round",
    ],
    params: [
      {
        id: "new_rank",
        type: "select",
        label: "New Rank",
        options: [
          { value: "none", label: "Don't Change" },
          { value: "random", label: "Random" },
          ...RANKS.map((rank) => ({ value: rank.label, label: rank.label })),
        ],
        default: "none",
        variableTypes: ["rank"],
      },
      {
        id: "new_suit",
        type: "select",
        label: "New Suit",
        options: [
          { value: "none", label: "Don't Change" },
          { value: "random", label: "Random" },
          ...SUITS,
        ],
        default: "none",
        variableTypes: ["suit"],
      },
      {
        id: "variables",
        type: "checkbox",
        label: "Which types are Variables?",
        checkboxOptions: [
          { value: "A", label: "Enhancement"},
          { value: "B", label: "Seal"},
          { value: "C", label: "Edition"}
        ],
        default: [false, false, false],
        exemptObjects: ["card"]
      },
      {
        id: "new_enhancement",
        type: "select",
        label: "New Enhancement",
        options: () => [
          { value: "none", label: "Don't Change" },
          { value: "remove", label: "Remove Enhancement" },
          { value: "random", label: "Random" },
          ...ENHANCEMENTS().map((enhancement) => ({
            value: enhancement.key,
            label: enhancement.label,
          })),
        ],
        default: "none",
        variableTypes: ["key"],
      },
      {
        id: "new_seal",
        type: "select",
        label: "New Seal",
        options: () => [
          { value: "none", label: "Don't Change" },
          { value: "remove", label: "Remove Seal" },
          { value: "random", label: "Random" },
          ...SEALS().map((seal) => ({
            value: seal.key,
            label: seal.label,
          })),
        ],
        default: "none",
        variableTypes: ["key"],
      },
      {
        id: "new_edition",
        type: "select",
        label: "New Edition",
        options: [
          { value: "none", label: "Don't Change" },
          { value: "remove", label: "Remove Edition" },
          { value: "random", label: "Random" },
          ...EDITIONS().map((edition) => ({
            value: edition.key,
            label: edition.label,
          })),
        ],
        default: "none",
        variableTypes: ["key"],
      },
    ],
    category: "Card Effects",
  },
  {
    id: "edit_cards",
    label: "Edit Cards",
    description: "Apply multiple modifications to selected cards (enhancement, seal, edition, suit, rank)",
    objectUsers: ["consumable"],
    applicableTriggers: ["card_used"],
    params: [
      {
        id: "selection_method",
        type: "select",
        label: "Cards to Edit",
        options: [
          { value: "random", label: "Random Cards"},
          { value: "selected", label: "Selected Cards"},
        ],
        default: "random",
      },
      {
        id: "enhancement",
        type: "select",
        label: "Enhancement Type",
        options: [
          { value: "none", label: "No Change" },
          { value: "remove", label: "Remove Enhancement" },
          ...ENHANCEMENTS().map((enhancement) => ({value: enhancement.key, label: enhancement.label})),
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
          { value: "remove", label: "Remove Seal" },
          { value: "random", label: "Random Seal" },
          ...SEALS().map((seal) => ({
            value: seal.key,
            label: seal.label,
          })),
        ],
        default: "none",
      },
      {
        id: "edition",
        type: "select",
        label: "Edition Type",
        options: [
          { value: "none", label: "No Change" },
          { value: "remove", label: "Remove Edition" },
          ...EDITIONS().map((edition) => ({
            value: edition.key,
            label: edition.label,
          })),
          { value: "random", label: "Random Edition" },
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
          { value: "pool", label: "Random from Pool" },
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
        }
      },
      {
        id: "rank",
        type: "select",
        label: "Rank",
        options: [
          { value: "none", label: "No Change" },
          ...RANKS.map((rank) => ({ value: rank.value, label: rank.label })),
          { value: "random", label: "Random Rank" },
          { value: "pool", label: "Random from Pool" },
        ],
        default: "none",
      },
      {
        id: "rank_pool",
        type: "checkbox",
        label: "Possible Ranks",
        checkboxOptions: [...RANKS],
        showWhen: {
          parameter: "rank",
          values: ["pool"],
        }
      },
    ],
    category: "Card Effects",
  },
  {
    id: "convert_all_cards_to_suit",
    label: "Convert All Cards to Suit",
    description: "Convert all cards in hand to a specific suit",
    objectUsers: ["consumable"],
    applicableTriggers: ["card_used", "held_hand"],
    params: [
      {
        id: "suit",
        type: "select",
        label: "Target Suit",
        options: [
          ...SUITS, 
          { value: "random", label: "Random Suit" },
          { value: "pool", label: "Random from Pool" }
        ],
        default: "Hearts",
      },
      {
        id: "suit_pool",
        type: "checkbox",
        label: "Possible Suits",
        checkboxOptions: [...SUITS],
        showWhen: {
          parameter: "suit",
          values: ["pool"],
        }
      },
    ],
    category: "Card Effects",
  },
  {
    id: "convert_all_cards_to_rank",
    label: "Convert All Cards to Rank",
    description: "Convert all cards in hand to a specific rank",
    objectUsers: ["consumable"],
    applicableTriggers: ["card_used", "held_hand"],
    params: [
      {
        id: "rank",
        type: "select",
        label: "Target Rank",
        options: [
          ...RANKS.map((rank) => ({ value: rank.label, label: rank.label })),
          { value: "random", label: "Random Rank" },
          { value: "pool", label: "Random from Pool" },
        ],
        default: "Ace",
      },
      {
        id: "rank_pool",
        type: "checkbox",
        label: "Possible Ranks",
        checkboxOptions: [...RANKS],
        showWhen: {
          parameter: "rank",
          values: ["pool"],
        }
      },     
    ],
    category: "Card Effects",
  },
  {
    id: "convert_left_to_right",
    label: "Convert Left to Right",
    description: "Convert all selected cards to match the rightmost selected card (like Death tarot)",
    objectUsers: ["consumable"],
    applicableTriggers: ["card_used"],
    params: [],
    category: "Card Effects",
  },
  {
    id: "increment_rank",
    label: "Increment/Decrement Rank",
    description: "Increase or decrease the rank of selected cards by a specified amount",
    objectUsers: ['consumable'],
    applicableTriggers: ["card_used"],
    params: [
      {
        id: "operation",
        type: "select",
        label: "Operation",
        options: [
          { value: "increment", label: "Increment (+)" },
          { value: "decrement", label: "Decrement (-)" },
        ],
        default: "increment",
      },
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 1,
        min: 1,
        max: 13,
      },
    ],
    category: "Card Effects",
  },
  {
    id: "permanent_bonus",
    label: "Add Permanent Bonus",
    description:
      "Add permanent bonuses to the triggered card (like Hiker joker)",
    applicableTriggers: [
      "card_scored", 
      "card_held_in_hand", 
      "card_held_in_hand_end_of_round", 
      "playing_card_added", 
      "card_discarded",
      "card_used"
    ],
    objectUsers: ["joker", "consumable"],
    params: [
      {
        id: "bonus_type",
        type: "select",
        label: "Bonus Type",
        options: [
          { value: "perma_bonus", label: "Permanent Chips" },
          { value: "perma_mult", label: "Permanent Mult" },
          { value: "perma_x_chips", label: "Permanent X Chips" },
          { value: "perma_x_mult", label: "Permanent X Mult" },
          { value: "perma_h_chips", label: "Permanent Held Chips" },
          { value: "perma_h_mult", label: "Permanent Held Mult" },
          { value: "perma_h_x_chips", label: "Permanent Held X Chips" },
          { value: "perma_h_x_mult", label: "Permanent Held X Mult" },
          { value: "perma_p_dollars", label: "Permanent Dollars (on scoring)" },
          {
            value: "perma_h_dollars",
            label: "Permanent Held Dollars (end of round)",
          },
        ],
        default: "perma_bonus",
      },
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 1,
        min: 0,
      },
    ],
    category: "Card Effects",
  },
  {
    id: "destroy_playing_card",
    label: "Destroy Card",
    description: "Destroy this Card",
    applicableTriggers: [
      "card_scored",
      "card_discarded",
      "card_held_in_hand",
      "card_held_in_hand_end_of_round",
    ],
    objectUsers: ["joker", "card"],
    params: [
      {
        id: "set_glass_trigger",
        label: "Glass Cards Triggered?",
        description: "Should Jokers like glass joker be triggered?",
        type: "select",
        options: [
          { value: "y", label: "True"},
          { value: "n", label: "False"},
        ],
        default: "n",
        exemptObjects: ["joker"]
      }
    ],
    category: "Card Effects",
  },
  {
    id: "destroy_cards",
    label: "Destroy Cards",
    description: "Destroy a number of cards from hand",
    objectUsers: ["consumable"],
    applicableTriggers: ["card_used", "held_hand"],
    params: [
      {
        id: "method",
        type: "select",
        label: "Selection Method",
        options: [
          { value: 'random', label: 'Random'},
          { value: 'selected', label: 'Selected'},
        ],
        default: 'random',
      },
      {
        id: "count",
        type: "number",
        label: "Number of Cards",
        default: 1,
        min: 1,
        showWhen: { parameter: "method", values: ["random"]}
      },
    ],
    category: "Card Effects",
  },
]