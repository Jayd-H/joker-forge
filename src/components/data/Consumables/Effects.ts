import { EffectTypeDefinition } from "../../ruleBuilder/types";
import {
  PencilSquareIcon,
  BanknotesIcon,
  SparklesIcon,
  Cog6ToothIcon,
  CakeIcon,
  UserGroupIcon,
  CursorArrowRaysIcon,
  HandRaisedIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { CategoryDefinition } from "../Jokers/Triggers";
import {
  ENHANCEMENTS,
  SUITS,
  RANKS,
  SEALS,
  EDITIONS,
  POKER_HANDS,
  TAROT_CARDS,
  PLANET_CARDS,
  SPECTRAL_CARDS,
  CUSTOM_CONSUMABLES,
  CONSUMABLE_SETS,
  RARITIES,
  TAGS,
  VOUCHERS,
  STICKERS,
} from "../BalatroUtils";

export const CONSUMABLE_EFFECT_CATEGORIES: CategoryDefinition[] = [
  {
    label: "Selected Cards",
    icon: CursorArrowRaysIcon,
  },
  {
    label: "Card Modification",
    icon: PencilSquareIcon,
  },
  {
    label: "Economy",
    icon: BanknotesIcon,
  },
  {
    label: "Shop Effects",
    icon: ShoppingBagIcon,
  },
  {
    label: "Hand Effects",
    icon: HandRaisedIcon,
  },
    {
    label: "Game Rules",
    icon: Cog6ToothIcon,
  },
  {
    label: "Consumables",
    icon: CakeIcon,
  },
  {
    label: "Jokers",
    icon: UserGroupIcon,
  },
  {
    label: "Special",
    icon: SparklesIcon,
  },
];

export const CONSUMABLE_EFFECT_TYPES: EffectTypeDefinition[] = [
  // ===== SELECTED CARDS EFFECTS =====
  {
    id: "edit_cards",
    label: "Edit Selected Cards",
    description:
      "Apply multiple modifications to selected cards (enhancement, seal, edition, suit, rank)",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "enhancement",
        type: "select",
        label: "Enhancement Type",
        options: () => [
          { value: "none", label: "No Change" },
          { value: "remove", label: "Remove Enhancement" },
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
    category: "Selected Cards",
  },
  {
    id: "destroy_selected_cards",
    label: "Destroy Selected Cards",
    description: "Destroy all currently selected cards",
    applicableTriggers: ["consumable_used"],
    params: [],
    category: "Selected Cards",
  },
  {
    id: "increment_rank",
    label: "Increment/Decrement Rank",
    description:
      "Increase or decrease the rank of selected cards by a specified amount",
    applicableTriggers: ["consumable_used"],
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
    category: "Selected Cards",
  },
  {
    id: "copy_selected_cards",
    label: "Copy Selected Cards",
    description: "Create copies of selected cards with customizable properties",
    applicableTriggers: ["consumable_used"],
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
    category: "Selected Cards",
  },
  {
    id: "convert_left_to_right",
    label: "Convert Left to Right",
    description:
      "Convert all selected cards to match the rightmost selected card (like Death tarot)",
    applicableTriggers: ["consumable_used"],
    params: [],
    category: "Selected Cards",
  },
  {
    id: "perma_bonus",
    label: "Give Permanent Bonus",
    description:
      "Give selected cards a permanent bonus that persists throughout the run",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "bonus_type",
        type: "select",
        label: "Bonus Type",
        options: [
          { value: "perma_bonus", label: "Permanent Chips" },
          { value: "perma_mult", label: "Permanent Mult" },
          { value: "h_mult", label: "Held Mult" },
          { value: "h_chips", label: "Held Chips" },
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
        label: "Bonus Amount",
        default: 10,
        min: 1,
      },
    ],
    category: "Selected Cards",
  },

  // ===== HAND EFFECTS =====
  {
    id: "edit_hand_size",
    label: "Edit Hand Size",
    description: "Add, subtract, or set the player's hand size",
    applicableTriggers: ["consumable_used"],
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
        label: "Amount",
        default: 1,
        min: 1,
        max: 50,
      },
    ],
    category: "Hand Effects",
  },
  {
    id: "draw_cards",
    label: "Draw Cards to Hand",
    description: "Draw cards from your deck to your hand",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 1,
      },
    ],
    category: "Hand Effects",
  },
  {
    id: "edit_play_size",
    label: "Edit Play Size",
    description: "Add, subtract, or set the player's play size",
    applicableTriggers: ["consumable_used"],
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
        label: "Amount",
        default: 1,
        min: 1,
        max: 50,
      },
    ],
    category: "Hand Effects",
  },
  {
    id: "edit_discard_size",
    label: "Edit Discard Size",
    description: "Add, subtract, or set the player's discard size",
    applicableTriggers: ["consumable_used"],
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
        label: "Amount",
        default: 1,
        min: 1,
        max: 50,
      },
    ],
    category: "Hand Effects",
  },
  {
    id: "edit_voucher_slots",
    label: "Edit Voucher Slots",
    description: "Modify the number of vouchers available in shop",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "operation",
        type: "select",
        label: "Operation",
        options: [
          { value: "add", label: "Add" },
          { value: "subtract", label: "Subtract" },
          { value: "set", label: "Set to" },
        ],
        default: "add",
      },
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 1,
        min: 0,
      },
    ],
    category: "Shop Effects",
  },
  {
    id: "edit_booster_slots",
    label: "Edit Booster Slots",
    description: "Modify the number of booster packs available in shop",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "operation",
        type: "select",
        label: "Operation",
        options: [
          { value: "add", label: "Add" },
          { value: "subtract", label: "Subtract" },
          { value: "set", label: "Set to" },
        ],
        default: "add",
      },
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 1,
        min: 0,
      },
    ],
    category: "Shop Effects",
  },
    {
      id: "set_ante",
      label: "Set Ante Level",
      description: "Modify the current ante level",
      applicableTriggers: ["consumable_used"],
      params: [
        {
          id: "operation",
          type: "select",
          label: "Operation",
          options: [
            { value: "set", label: "Set to" },
            { value: "add", label: "Add" },
            { value: "subtract", label: "Subtract" },
          ],
          default: "set",
        },
        {
          id: "value",
          type: "number",
          label: "Amount",
          default: 1,
          min: 1,
        },
      ],
      category: "Game Rules",
    },
  {
    id: "edit_hands",
    label: "Edit Hands",
    description: "Add, subtract, or set the player's hands for this round",
    applicableTriggers: ["consumable_used"],
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
        id: "duration",
        type: "select",
        label: "Duration",
        options: [
          { value: "permanent", label: "Permanent" },
          { value: "round", label: "This Round" },
        ],
        default: "permanent",
      },
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 1,
        min: 1,
        max: 50,
      },
    ],
    category: "Hand Effects",
  },
  {
    id: "edit_discards",
    label: "Edit Discards",
    description: "Add, subtract, or set the player's discards for this round",
    applicableTriggers: ["consumable_used"],
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
        id: "duration",
        type: "select",
        label: "Duration",
        options: [
          { value: "permanent", label: "Permanent" },
          { value: "round", label: "This Round" },
        ],
        default: "permanent",
      },
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 1,
        min: 1,
        max: 50,
      },
    ],
    category: "Hand Effects",
  },

  // ===== OTHER EFFECTS =====
  {
    id: "convert_all_cards_to_suit",
    label: "Convert All Cards to Suit",
    description: "Convert all cards in hand to a specific suit",
    applicableTriggers: ["consumable_used"],
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
    category: "Card Modification",
  },
  {
    id: "convert_all_cards_to_rank",
    label: "Convert All Cards to Rank",
    description: "Convert all cards in hand to a specific rank",
    applicableTriggers: ["consumable_used"],
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
    category: "Card Modification",
  },
  {
    id: "destroy_random_cards",
    label: "Destroy Random Cards",
    description: "Destroy a number of random cards from hand",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "count",
        type: "number",
        label: "Number of Cards",
        default: 1,
        min: 1,
        max: 8,
      },
    ],
    category: "Card Modification",
  },
{
    id: "flip_joker",
    label: "Flip Joker",
    description: "Flip a joker",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "selection_method",
        type: "select",
        label: "Selection Method",
        options: [
          { value: "all", label: "All Jokers" },
          { value: "random", label: "Random Joker" },
          { value: "selected", label: "By Selection" },
        ],
        default: "all",
      },
    ],
    category: "Jokers",
  },
  {
      id: "disable_boss_blind",
      label: "Disable Boss Blind",
      description: "Disable the current boss blind, removing its effect",
      applicableTriggers: ["consumable_used"],
      params: [],
      category: "Game Rules",
    },
      {
        id: "shuffle_jokers",
        label: "Shuffle Jokers",
        description: "Shuffle all jokers",
        applicableTriggers: ["consumable_used"],
        params: [],
        category: "Jokers",
      },
      {
    id: "modify_blind_requirement",
    label: "Modify Blind Requirement",
    description: "Changes the score requirement of a blind",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "operation",
        type: "select",
        label: "Operation",
        options: [
          { value: "add", label: "Add" },
          { value: "subtract", label: "Subtract" },
          { value: "set", label: "Set to" },
          { value: "multiply", label: "Multiply" },
          { value: "divide", label: "Divide" },
        ],
        default: "multiply",
      },
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 2,
      },
    ],
    category: "Game Rules",
  },
  {
      id: "force_game_over",
      label: "Force Game Over",
      description: "Forces the run to end (ignores Mr. Bones)",
      applicableTriggers: ["consumable_used"],
      params: [],
      category: "Special",
    },
      {
      id: "Win_blind",
      label: "Win Current Blind",
      description: "Forces to Win the current Blind",
      applicableTriggers: ["consumable_used"],
      params: [],
      category: "Special",
    },
  {
    id: "edit_joker_slots",
    label: "Edit Joker Slots",
    description: "Add or remove joker slots available in the game",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "operation",
        type: "select",
        label: "Operation",
        options: [
          { value: "add", label: "Add" },
          { value: "subtract", label: "Subtract" },
          { value: "set", label: "Set to" },
        ],
        default: "add",
      },
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 1,
        min: 0,
      },
    ],
    category: "Jokers",
  },
  {
    id: "add_cards_to_hand",
    label: "Add Cards to Hand",
    description: "Create and add new cards to hand with specified properties",
    applicableTriggers: ["consumable_used"],
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
    category: "Card Modification",
  },
  {
    id: "level_up_hand",
    label: "Level Up Poker Hand",
    description: "Level up a specific poker hand, random hand, or all hands",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "hand_type",
        type: "select",
        label: "Poker Hand",
        options: [
          ...POKER_HANDS.map((hand) => ({
            value: hand.value,
            label: hand.label,
          })),
          { value: "random", label: "Random Hand" },
          { value: "all", label: "All Hands" },
          { value: "pool", label: "Random from Pool" },
        ],
        default: "Pair",
      },
      {
        id: "pokerhand_pool",
        type: "checkbox",
        label: "Possible PokerHands",
        checkboxOptions: [...POKER_HANDS],
        showWhen: {
          parameter: "hand_type",
          values: ["pool"],
        }
      },
      {
        id: "levels",
        type: "number",
        label: "Number of Levels",
        default: 1,
        min: 1,
        max: 10,
      },
    ],
    category: "Hand Effects",
  },
  {
    id: "edit_dollars",
    label: "Edit Dollars",
    description: "Add, subtract, or set the player's money",
    applicableTriggers: ["consumable_used"],
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
    id: "double_dollars",
    label: "Double Dollars",
    description: "Double your current money up to a specified limit",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "limit",
        type: "number",
        label: "Maximum Amount to Gain",
        default: 20,
        min: 1,
        max: 999,
      },
    ],
    category: "Economy",
  },
  {
    id: "add_dollars_from_jokers",
    label: "Add Dollars from Joker Sell Value",
    description:
      "Gain money equal to the total sell value of all jokers, up to a limit",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "limit",
        type: "number",
        label: "Maximum Amount to Gain",
        default: 50,
        min: 1,
        max: 999,
      },
    ],
    category: "Economy",
  },
  {
    id: "create_consumable",
    label: "Create Consumable",
    description:
      "Create consumable cards and add them to your consumables area",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "set",
        type: "select",
        label: "Consumable Set",
        options: () => [
          { value: "random", label: "Random Consumable" },
          ...CONSUMABLE_SETS(),
        ],
        default: "random",
      },{
        id: "specific_card",
        type: "select",
        label: "Specific Card",
        options: (parentValues: Record<string, unknown>) => {
          const selectedSet = parentValues?.set as string;
          if (!selectedSet || selectedSet === "random") {
            return [{ value: "random", label: "Random from Set" }];
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
              { value: "random", label: "Random from Set" },
              ...vanillaCards,
              ...customCards,
            ];}
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
              { value: "random", label: "Random from Set" },
              ...vanillaCards,
              ...customCards,
            ];}
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
              { value: "random", label: "Random from Set" },
              ...vanillaCards,
              ...customCards,
            ];
          }
          // Handle custom sets
          // Remove mod prefix to get the actual set key
          const setKey = selectedSet.includes("_")
            ? selectedSet.split("_").slice(1).join("_")
            : selectedSet;
          const customConsumablesInSet = CUSTOM_CONSUMABLES().filter(
            (consumable) =>
              consumable.set === setKey || consumable.set === selectedSet
          );
          return [
            { value: "random", label: "Random from Set" },
            ...customConsumablesInSet,
          ];},
        default: "random",
      },{
        id: "soulable",
        type: "select",
        label: "Soulable",
        options: [
          { value: "y", label: "Yes" },
          { value: "n", label: "No" },
        ],
        showWhen: {
          parameter: "specific_card",
          values: ["random"],
        },
        default:"n",
      },{
        id: "is_negative",
        type: "select",
        label: "Edition",
        options: [
          { value: "n", label: "No Edition" },
          { value: "y", label: "Negative Edition" },
        ],
        default: "n",
      },{
        id: "count",
        type: "number",
        label: "Number of Cards",
        default: 1,
        min: 1,
        max: 5,
      },{
        id: "ignore_slots",
        type: "select",
        label: "Ignore Slots",
        options: [
          { value: "y", label: "True" },
          { value: "n", label: "False" },
        ],
        default:"n",
      },
    ],
    category: "Consumables",
  },
  {
    id: "destroy_consumable",
    label: "Destroy Consumable",
    description: "Destroy a consumable card from your collection",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "set",
        type: "select",
        label: "Consumable Set",
        options: () => [
          { value: "random", label: "Random Consumable" },
          ...CONSUMABLE_SETS(),
        ],
        default: "random",
      },
      {
        id: "specific_card",
        type: "select",
        label: "Specific Card",
        options: (parentValues: Record<string, unknown>) => {
          const selectedSet = parentValues?.set as string;

          if (!selectedSet || selectedSet === "random") {
            return [{ value: "random", label: "Random from Set" }];
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
              { value: "random", label: "Random from Set" },
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
              { value: "random", label: "Random from Set" },
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
              { value: "random", label: "Random from Set" },
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
            { value: "random", label: "Random from Set" },
            ...customConsumablesInSet,
          ];
        },
        default: "random",
      },
    ],
    category: "Consumables",
  },
  {
    id: "fool_effect",
    label: "Create Last Used Consumable",
    description:
      "Create a copy of the last Tarot or Planet card that was used (like The Fool)",
    applicableTriggers: ["consumable_used"],
    params: [],
    category: "Consumables",
  },
  {
    id: "create_tag",
    label: "Create Tag",
    description: "Create a specific or random tag",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "tag_type",
        type: "select",
        label: "Tag Type",
        options: [
          { value: "random", label: "Random Tag" },
          { value: "specific", label: "Specific Tag" },
        ],
        default: "random",
      },
      {
        id: "specific_tag",
        type: "select",
        label: "Specific Tag",
        options: [...TAGS],
        showWhen: {
          parameter: "tag_type",
          values: ["specific"],
        },
      },
    ],
    category: "Consumables",
  },
  {
    id: "redeem_voucher",
    label: "Redeem Voucher",
    description: "Redeem a specific or random voucher",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "voucher_type",
        type: "select",
        label: "Voucher Type",
        options: [
          { value: "random", label: "Random Voucher" },
          { value: "specific", label: "Specific Voucher" },
        ],
        default: "random",
      },
      {
        id: "specific_voucher",
        type: "select",
        label: "Specific Voucher",
        options: [...VOUCHERS()],
        showWhen: {
          parameter: "voucher_type",
          values: ["specific"],
        },
        default: "v_overstock_norm",
      },
    ],
    category: "Consumables",
  },
  {
    id: "edit_cards_in_hand",
    label: "Edit Cards in Hand",
    description:
      "Apply multiple modifications to random cards in hand (enhancement, seal, edition, suit, rank)",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "amount",
        type: "number",
        label: "Number of Cards",
        default: 1,
        min: 1,
        max: 8,
      },
      {
        id: "enhancement",
        type: "select",
        label: "Enhancement Type",
        options: () => [
          { value: "none", label: "No Change" },
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
          { value: "none", label: "No Change" },
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
          ...RANKS.map((rank) => ({ value: rank.label, label: rank.label })),
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
    category: "Card Modification",
  },
  {
    id: "create_joker",
    label: "Create Joker",
    description:
      "Create a random or specific joker card. For creating jokers from your own mod, it is [modprefix]_[joker_name]. You can find your mod prefix in the mod metadata page.",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "joker_type",
        type: "select",
        label: "Joker Type",
        options: [
          { value: "random", label: "Random Joker" },
          { value: "specific", label: "Specific Joker" },
        ],
        default: "random",
      },
      {
        id: "rarity",
        type: "select",
        label: "Rarity",
        options: () => [
          { value: "random", label: "Any Rarity" },
          ...RARITIES(),
        ],
        default: "random",
        showWhen: {
          parameter: "joker_type",
          values: ["random"],
        },
      },
      {
        id: "joker_key",
        type: "text",
        label: "Joker Key ( [modprefix]_joker )",
        default: "joker",
        showWhen: {
          parameter: "joker_type",
          values: ["specific"],
        },
      },
      {
        id: "pool",
        type: "text",
        label: "Pool Name (optional)",
        default: "",
        showWhen: {
          parameter: "joker_type",
          values: ["random"],
        },
      },
      {
        id: "edition",
        type: "select",
        label: "Edition",
        options: [
          { value: "none", label: "No Edition" },
          ...EDITIONS().map((edition) => ({
            value: edition.key,
            label: edition.label,
          })),
        ],
        default: "none",
      },
      {
        id: "sticker",
        type: "select",
        label: "Sticker for Copy",
        options: [{ value: "none", label: "No Sticker" }, ...STICKERS],
        default: "none",
      },
      {
        id: "ignore_slots",
        type: "select",
        label: "___ Joker Slots",
        options: [
          { value: "respect", label: "Respect" },
          { value: "ignore", label: "Ignore" },
        ],
        default: "respect",
      },
    ],
    category: "Jokers",
  },
  {
    id: "copy_joker",
    label: "Copy Joker",
    description: "Create copies of jokers in your joker area",
    applicableTriggers: ["consumable_used"],
    params: [
       {
        id: "selection_method",
        type: "select",
        label: "Selection Method",
        options: [
          { value: "random", label: "Random Joker" },
          { value: "selected", label: "Selected Joker" },
        ],
      },
      {
        id: "amount",
        type: "number",
        label: "Number of Jokers to Copy",
        showWhen: {
          parameter: "selection_method",
          values: ["random"],
        },
        default: 1,
        min: 1,
        max: 5,
      },
      {
        id: "edition",
        type: "select",
        label: "Edition to Apply",
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
    category: "Jokers",
  },
  {
    id: "destroy_joker",
    label: "Destroy Joker",
    description:
      "Destroy jokers from your joker area (eternal jokers are safe)",
    applicableTriggers: ["consumable_used"],
    params: [
        {
        id: "selection_method",
        type: "select",
        label: "Destroy Joker",
        options: [
          { value: "random", label: "Random Joker" },
          { value: "selected", label: "Selected Joker" },
        ],
      },
      {
        id: "amount",
        type: "number",
        label: "Number of Jokers to Destroy",
          showWhen: {
          parameter: "selection_method",
          values: ["random"],
        },
        default: 1,
        min: 1,
        max: 5,
      },
    ],
    category: "Jokers",
  },
    {
    id: "edit_selected_joker",
    label: "Edit Selected Joker",
    description:
      "Apply Modifiers to selected Joker",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "sticker",
        type: "select",
        label: "Sticker",
        options: [
          { value: "none", label: "No Sticker" },
          ...STICKERS.map((sticker) => ({
            key: sticker.key,
            value: sticker.value,
            label: sticker.label,
          })),
        { value: "remove", label: "Remove Sticker" },
        ],
        default: "none",
      },
      {
        id: "edition",
        type: "select",
        label: "Edition",
        options: [
          { value: "none", label: "No Edition" },
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
    category: "Jokers",
  },
  {
    id: "edition_random_joker",
    label: "Apply Edition to Random Joker",
    description: "Apply an edition to random jokers in your joker area",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "amount",
        type: "number",
        label: "Number of Jokers to Apply Edition",
        default: 1,
        min: 1,
        max: 5,
      },
      {
        id: "edition",
        type: "select",
        label: "Edition to Apply",
        options: [
          ...EDITIONS().map((edition) => ({
            value: edition.key,
            label: edition.label,
          })),
          { value: "random", label: "Random Edition" },
          { value: "remove", label: "Remove Edition" },
        ],
        default: "e_foil",
      },
      {
        id: "target_type",
        type: "select",
        label: "Target Jokers",
        options: [
          { value: "editionless", label: "Only Editionless Jokers" },
          { value: "any", label: "Any Jokers" },
        ],
        default: "editionless",
      },
    ],
    category: "Jokers",
  },
  {
    id: "emit_flag",
    label: "Emit Flag",
    description:
      "Emit a custom flag. Flags are global variables that can be set to true or false and checked by any other jokers",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "flag_name",
        type: "text",
        label: "Unique Flag Name",
        default: "custom_flag",
      },
      {
        id: "change",
        type: "select",
        label: "Set Flag to",
        options: [
          { value: "true", label: "True" },
          { value: "false", label: "False" },
          { value: "invert", label: "Invert Current" },
        ],
        default: "true",
      },
    ],
    category: "Special",
  },
  {
    id: "play_sound",
    label: "Play a sound",
    description: "Play a specific sound defined in the Sound Tab",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "sound_key",
        type: "text",
        label: "Sound Key (modprefix_key)",
        default: "",
      },
    ],
    category: "Special",
  },
  {
    id: "crash_game",
    label: "Crash the Game",
    description: "Crash the Game with a Custom message",
    applicableTriggers: ["consumable_used"],
    params: [],
    category: "Special",
  },
];

export function getConsumableEffectsForTrigger(
  triggerId: string
): EffectTypeDefinition[] {
  return CONSUMABLE_EFFECT_TYPES.filter((effect) =>
    effect.applicableTriggers?.includes(triggerId)
  );
}

export function getConsumableEffectTypeById(
  id: string
): EffectTypeDefinition | undefined {
  return CONSUMABLE_EFFECT_TYPES.find((effect) => effect.id === id);
}

export function getSelectedCardEffects(): EffectTypeDefinition[] {
  return CONSUMABLE_EFFECT_TYPES.filter(
    (effect) => effect.category === "Selected Cards"
  );
}

export function getNonSelectedCardEffects(): EffectTypeDefinition[] {
  return CONSUMABLE_EFFECT_TYPES.filter(
    (effect) => effect.category !== "Selected Cards"
  );
}
