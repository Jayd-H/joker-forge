import { EffectTypeDefinition } from "../../ruleBuilder/types";
import {
  ChartBarIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  ReceiptPercentIcon,
  PencilSquareIcon,
  SparklesIcon,
  CakeIcon,
  UserGroupIcon,
  VariableIcon,
} from "@heroicons/react/24/outline";
import { CategoryDefinition } from "./Triggers";
import { GENERIC_TRIGGERS } from "./Conditions";
import {
  RANKS,
  SUITS,
  ENHANCEMENTS,
  EDITIONS,
  SEALS,
  POKER_HANDS,
  TAROT_CARDS,
  PLANET_CARDS,
  SPECTRAL_CARDS,
  ALL_CONSUMABLES,
  RARITIES,
  CONSUMABLE_TYPES,
  TAGS,
  CUSTOM_CONSUMABLES,
  CONSUMABLE_SETS,
  STICKERS,
  VOUCHERS,
} from "../BalatroUtils";

export const EFFECT_CATEGORIES: CategoryDefinition[] = [
  {
    label: "Scoring",
    icon: ChartBarIcon,
  },
  {
    label: "Economy",
    icon: BanknotesIcon,
  },
  {
    label: "Card Effects",
    icon: PencilSquareIcon,
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
    label: "Game Rules",
    icon: Cog6ToothIcon,
  },
  {
    label: "Probability",
    icon: ReceiptPercentIcon,
  },
  {
    label: "Variables",
    icon: VariableIcon,
  },
  {
    label: "Special",
    icon: SparklesIcon,
  },  
];

export const EFFECT_TYPES: EffectTypeDefinition[] = [
  {
    id: "add_chips",
    label: "Add Chips",
    description: "Add a flat amount of chips to the hand score",
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "joker_evaluated",
    ],
    params: [
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 10,
        min: 0,
      },
    ],
    category: "Scoring",
  },
  {
    id: "apply_x_chips",
    label: "Apply xChips",
    description: "Multiply the chips by this value",
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "joker_evaluated",
    ],
    params: [
      {
        id: "value",
        type: "number",
        label: "Multiplier",
        default: 1.5,
      },
    ],
    category: "Scoring",
  },
  {
    id: "apply_exp_chips",
    label: "Apply ^Chips (Exponential)",
    description: "Apply exponential chips (echips) - REQUIRES TALISMAN MOD",
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "joker_evaluated",
    ],
    params: [
      {
        id: "value",
        type: "number",
        label: "Exponential Chips Value",
        default: 1.1,
      },
    ],
    category: "Scoring",
  },
  {
    id: "apply_hyper_chips",
    label: "Apply HyperChips",
    description: "Apply (n)^ chips - REQUIRES TALISMAN MOD",
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "joker_evaluated",
    ],
    params: [
      {
        id: "arrows",
        type: "number",
        label: "Number of Arrows",
        default: 1,
        min: 1
      },
      {
        id: "value",
        type: "number",
        label: "Hyper Chips Value",
        default: 1.1,
      },
    ],
    category: "Scoring",
  },
  {
    id: "add_mult",
    label: "Add Mult",
    description: "Add a flat amount of mult to the hand score",
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "joker_evaluated",
    ],
    params: [
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 5,
        min: 0,
      },
    ],
    category: "Scoring",
  },
  {
    id: "apply_x_mult",
    label: "Apply xMult",
    description: "Multiply the score by this value",
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "joker_evaluated",
    ],
    params: [
      {
        id: "value",
        type: "number",
        label: "Multiplier",
        default: 1.5,
      },
    ],
    category: "Scoring",
  },
  {
    id: "apply_exp_mult",
    label: "Apply ^Mult (Exponential)",
    description: "Apply exponential mult (emult) - REQUIRES TALISMAN MOD",
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "joker_evaluated",
    ],
    params: [
      {
        id: "value",
        type: "number",
        label: "Exponential Mult Value",
        default: 1.1,
      },
    ],
    category: "Scoring",
  },
  {
    id: "apply_hyper_mult",
    label: "Apply HyperMult",
    description: "Apply (n)^ mult - REQUIRES TALISMAN MOD",
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "joker_evaluated",
    ],
    params: [
      {
        id: "arrows",
        type: "number",
        label: "Number of Arrows",
        default: 1,
        min: 1
      },
      {
        id: "value",
        type: "number",
        label: "Hyper Mult Value",
        default: 1.1,
      },
    ],
    category: "Scoring",
  },
  {
    id: "set_dollars",
    label: "Edit Dollars",
    description: "Modify your money balance",
    applicableTriggers: [...GENERIC_TRIGGERS],
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
        default: 5,
      },
    ],
    category: "Economy",
  },
  {
    id: "allow_debt",
    label: "Allow Debt",
    description: "Allow the player to go into debt by a specified amount",
    applicableTriggers: ["passive"],
    params: [
      {
        id: "value",
        type: "number",
        label: "Debt Amount",
        default: 20,
      },
    ],
    category: "Economy",
  },
  {
    id: "retrigger_cards",
    label: "Retrigger",
    description: "Retrigger the scored/activated card",
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
    id: "level_up_hand",
    label: "Level Up Hand",
    description: "Increase the level of a poker hand",
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [
      {
        id: "hand_selection",
        type: "select",
        label: "Hand Selection",
        options: [
          { value: "current", label: "Current Hand (Played/Discarded)" },
          { value: "specific", label: "Specific Hand" },
          { value: "most", label: "Most Played" },
          { value: "least", label: "Least Played" },
          { value: "random", label: "Random Hand" },
        ],
        default: "current",
        variableTypes: ["pokerhand"],
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
        label: "Levels",
        default: 1,
        min: 1,
      },
    ],
    category: "Game Rules",
  },
  {
    id: "edit_hand",
    label: "Edit Hands",
    description: "Modify the number of hands available",
    applicableTriggers: [...GENERIC_TRIGGERS, "passive"],
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
        min: 0,
      },
    ],
    category: "Game Rules",
  },
  {
    id: "edit_discard",
    label: "Edit Discards",
    description: "Modify the number of discards available",
    applicableTriggers: [...GENERIC_TRIGGERS, "passive"],
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
        min: 0,
      },
    ],
    category: "Game Rules",
  },
  {
    id: "edit_hand_size",
    label: "Edit Hand Size",
    description: "Modify the hand size (number of cards you can hold)",
    applicableTriggers: [...GENERIC_TRIGGERS, "passive"],
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
      },
    ],
    category: "Game Rules",
  },
  {
    id: "draw_cards",
    label: "Draw Cards to Hand",
    description: "Draw cards from your deck to your hand",
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_destoyed",
      "card_held_in_hand",
      "after_hand_played",
      "before_hand_played",
      "consumable_used",
      "card_discarded",
      "hand_discarded",
    ],
    params: [
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 1,
      },
    ],
    category: "Game Rules",
  },
  {
    id: "edit_play_size",
    label: "Edit Play Size",
    description:
      "Modify the Play size (number of cards you can select and Play)",
    applicableTriggers: [...GENERIC_TRIGGERS, "passive"],
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
      },
    ],
    category: "Game Rules",
  },
  {
    id: "edit_discard_size",
    label: "Edit Discard Size",
    description:
      "Modify the Discard size (number of cards you can select and Discard)",
    applicableTriggers: [...GENERIC_TRIGGERS, "passive"],
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
      },
    ],
    category: "Game Rules",
  },
  {
    id: "modify_internal_variable",
    label: "Modify Internal Variable",
    description: "Change an internal variable value for this joker",
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [
      {
        id: "variable_name",
        type: "select",
        label: "Variable Name",
        default: "var1",
        variableTypes: ["number"],
      },
      {
        id: "operation",
        type: "select",
        label: "Operation",
        options: [
          { value: "set", label: "Set to value" },
          { value: "increment", label: "Increment by value" },
          { value: "decrement", label: "Decrement by value" },
          { value: "multiply", label: "Multiply by value" },
          { value: "divide", label: "Divide by value" },
          { value: "power", label: "Power by value" },
          { value: "absolute", label: "Make the value Absolute" },
          { value: "natural_log", label: "Natural logarithm the value" },
          { value: "log10", label: "Standard logarithm the value" },
          { value: "square_root", label: "Square root the value" },
          { value: "ceil", label: "Round value up" },
          { value: "floor", label: "Round value down" },
          { value: "index", label: "Set to the index of an owned Joker" },
        ],
      },
      {
        id: "index_method",
        type: "select",
        label: "Index Method",
        showWhen: {
          parameter: "operation",
          values: ["index"]
        },
        options: [
          { value: "self", label: "This Joker" },
          { value: "random", label: "A Random Joker" },
          { value: "first", label: "Leftmost Joker" },
          { value: "last", label: "Rightmost Joker" },
          { value: "left", label: "Joker on my Left" },
          { value: "right", label: "Joker on my Right" },
          { value: "key", label: "Joker Key" },
          { value: "variable", label: "Joker Variable" },
        ], 
        variableTypes: ["joker_context"]
      },
      {
        id: "joker_key",
        type: "text",
        label: "Joker Key ( [modprefix]_joker )",
        default: "j_joker",
        showWhen: {
          parameter: "index_method",
          values: ["key"],
        },
      },
      {
        id: "joker_variable",
        type: "select",
        label: "Joker Variable",
        showWhen: {
          parameter: "index_method",
          values: ["variable"],
        },
        variableTypes: ["joker"]
      },
      {
        id: "value",
        type: "number",
        label: "Value",
        default: 1,
        showWhen: {
          parameter: "operation",
          values: [
            "set", "increment", "decrement",
            "multiply", "divide", "power"
          ]
        },
      },
    ],
    category: "Variables",
  },
  {
    id: "add_card_to_deck",
    label: "Add Card to Deck",
    description: "Create a new playing card and add it to your deck",
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [
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
      },
    ],
    category: "Card Effects",
  },
  {
    id: "copy_triggered_card",
    label: "Copy Triggered Card",
    description: "Copy the card that triggered this effect to your deck",
    applicableTriggers: [
      "card_scored",
      "card_discarded",
      "card_held_in_hand",
      "card_held_in_hand_end_of_round",
    ],
    params: [],
    category: "Card Effects",
  },
  {
    id: "copy_played_card",
    label: "Copy Played Card",
    description: "Copy a specific card from the played hand to your deck",
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
    ],
    category: "Card Effects",
  },
  {
    id: "delete_triggered_card",
    label: "Destroy Triggered Card",
    description: "Destroy the card that triggered this effect",
    applicableTriggers: [
      "card_scored",
      "card_discarded",
      "card_held_in_hand",
      "card_held_in_hand_end_of_round",
    ],
    params: [],
    category: "Card Effects",
  },
  {
    id: "edit_triggered_card",
    label: "Edit Triggered Card",
    description: "Modify the properties of the card that triggered this effect",
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
      },
    ],
    category: "Card Effects",
  },
  {
    id: "add_card_to_hand",
    label: "Add Card to Hand",
    description: "Create a new playing card and add it to your hand",
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [
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
      },
    ],
    category: "Card Effects",
  },
  {
    id: "copy_triggered_card_to_hand",
    label: "Copy Triggered Card to Hand",
    description: "Copy the card that triggered this effect to your hand",
    applicableTriggers: [
      "card_scored",
      "card_discarded",
      "card_held_in_hand",
      "card_held_in_hand_end_of_round",
    ],
    params: [],
    category: "Card Effects",
  },
  {
    id: "copy_played_card_to_hand",
    label: "Copy Played Card to Hand",
    description: "Copy a specific card from the played hand to your hand",
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
    ],
    category: "Card Effects",
  },
  {
        id: "edit_win_ante",
        label: "Set Winner Ante",
        description: "Set the Final Ante where the Player Win's the Game",
        applicableTriggers: [...GENERIC_TRIGGERS],
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
    id: "set_sell_value",
    label: "Edit Sell Value",
    description: "Modify the sell value of jokers/consumables",
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [
      {
        id: "target",
        type: "select",
        label: "Target",
        options: [
          { value: "specific", label: "Specific Joker" },
          { value: "all_jokers", label: "All Jokers" },
          { value: "all", label: "All Jokers and Consumables" },
        ],
        default: "specific",
      },{
        id: "specific_target",
        type: "select",
        label: "Specific Joker",
        options: [
          { value: "self", label: "This Joker" },
          { value: "right", label: "Joker on my Right" },
          { value: "left", label: "Joker on my Left" },
          { value: "first", label: "Leftmost Joker" },
          { value: "last", label: "Rightmost Joker" },
          { value: "random", label: "Random Joker" },
        ],
        showWhen: {
          parameter: "target",
          values: ["specific"],},
        default: "self",
        variableTypes: ["joker_context"],
      },{
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
        label: "Sell Value Amount",
        default: 1,
        min: 0,
      },
    ],
    category: "Economy",
  },
  {
    id: "create_joker",
    label: "Create Joker",
    description:
      "Create a random or specific joker card. For creating jokers from your own mod, it is [modprefix]_[joker_name]. You can find your mod prefix in the mod metadata page.",
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [
      {
        id: "joker_type",
        type: "select",
        label: "Joker Type",
        options: [
          { value: "random", label: "Random Joker" },
          { value: "pool", label: "Random from Pool" },
          { value: "specific", label: "Specific Joker" },
        ],
        default: "random",
        variableTypes: ["joker", "joker_context"]
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
          values: ["pool"],
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
        label: "Sticker",
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
    description:
      "Copy an existing joker from your collection. For copying jokers from your own mod, it is j_[modprefix]_[joker_name]. You can find your mod prefix in the mod metadata page.",
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [
      {
        id: "selection_method",
        type: "select",
        label: "Selection Method",
        options: [
          { value: "random", label: "Random Joker" },
          { value: "position", label: "By Position" },
          { value: "selected", label: "Selected Joker" },
        ],
        default: "random",
        // variableTypes: ["joker_context", "joker"], --- VARIABLES FOR COPY ABILITY ARE TEMP DISABLED
      },
      {
        id: "position",
        type: "select",
        label: "Position",
        options: [
          { value: "first", label: "First Joker" },
          { value: "last", label: "Last Joker" },
          { value: "left", label: "Left of This Joker" },
          { value: "right", label: "Right of This Joker" },
          { value: "specific", label: "Specific Index" },
        ],
        default: "first",
        showWhen: {
          parameter: "selection_method",
          values: ["position"],
        },
      },
      {
        id: "specific_index",
        type: "number",
        label: "Joker Index (1-5)",
        default: 1,
        showWhen: {
          parameter: "position",
          values: ["specific"],
        },
      },
      {
        id: "edition",
        type: "select",
        label: "Edition for Copy",
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
    id: "destroy_joker",
    label: "Destroy Joker",
    description:
      "Destroy an existing joker from your collection. For destroying jokers from your own mod, it is j_[modprefix]_[joker_name]. You can find your mod prefix in the mod metadata page.",
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [
      {
        id: "selection_method",
        type: "select",
        label: "Selection Method",
        options: [
          { value: "random", label: "Random Joker" },
          { value: "specific", label: "Specific Joker" },
          { value: "position", label: "By Position" },
          { value: "selected", label: "Selected Joker" },
        ],
        default: "random",
        variableTypes: ["joker", "joker_context"],
      },
      {
        id: "joker_key",
        type: "text",
        label: "Joker Key (e.g., j_joker, j_greedy_joker)",
        default: "j_joker",
        showWhen: {
          parameter: "selection_method",
          values: ["specific"],
        },
      },
      {
        id: "position",
        type: "select",
        label: "Position",
        options: [
          { value: "first", label: "First Joker" },
          { value: "last", label: "Last Joker" },
          { value: "left", label: "Left of This Joker" },
          { value: "right", label: "Right of This Joker" },
          { value: "specific", label: "Specific Index" },
        ],
        default: "first",
        showWhen: {
          parameter: "selection_method",
          values: ["position"],
        },
      },
      {
        id: "specific_index",
        type: "number",
        label: "Joker Index (1-5)",
        default: 1,
        showWhen: {
          parameter: "position",
          values: ["specific"],
        },
      },
      {
        id: "bypass_eternal",
        type: "select",
        label: "Bypass Eternal",
        options: [
          { value: "no", label: "No" },
          { value: "yes", label: "Yes" },
        ],
        default: "no",
      },
      {
        id: "sell_value_multiplier",
        type: "number",
        label: "Sell Value Multiplier (0 = disabled)",
        
        default: 0,
      },
      {
        id: "variable_name",
        type: "text",
        label: "Variable to Add Sell Value To",
        default: "var1",
      },
    ],
    category: "Jokers",
  },
  {
    id: "unlock_joker",
    label: "Unlock Joker",
    description: "Unlock a locked joker in the collection ",
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [
      {
        id: "selection_method",
        type: "select",
        label: "Selection Method",
        default: "key",
        options: [
          { value: "key", label: "Joker Key" },
          // { value: "variable", label: "Joker Variable" }, --- TEMP DISABLED
        ]
      },
      {
        id: "joker_key",
        type: "text",
        label: "Joker Key ( [modprefix]_joker )",
        default: "joker",
        showWhen: {
          parameter: "selection_method",
          values: ["key"],
        },
      },
      {
        id: "joker_variable",
        type: "select",
        label: "Joker Variable",
        showWhen: {
          parameter: "selection_method",
          values: ["variable"],
        },
        variableTypes: ["joker"]
      },
      {
        id: "discover",
        type: "select",
        label: "Discover the Unlocked Joker",
        options: [
          { value: "true", label: "Discover" },
          { value: "false", label: "Leave Undiscovered" },
        ],
        default: "false",
      },
    ],
    category: "Jokers",
  },
  {
    id: "flip_joker",
    label: "Flip Joker",
    description: "Flip a joker",
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [
      {
        id: "selection_method",
        type: "select",
        label: "Selection Method",
        options: [
          { value: "all", label: "All Jokers" },
          { value: "random", label: "Random Joker" },
          { value: "self", label: "This Joker" },
          { value: "position", label: "By Position" },
          { value: "selected", label: "By Selection" },
        ],
        default: "all",
      },
      {
        id: "position",
        type: "select",
        label: "Position",
        options: [
          { value: "first", label: "First Joker" },
          { value: "last", label: "Last Joker" },
          { value: "left", label: "Left of This Joker" },
          { value: "right", label: "Right of This Joker" },
          { value: "specific", label: "Specific Index" },
        ],
        default: "first",
        showWhen: {
          parameter: "selection_method",
          values: ["position"],
        },
      },
      {
        id: "specific_index",
        type: "number",
        label: "Joker Index (1-5)",
        default: 1,
        showWhen: {
          parameter: "position",
          values: ["specific"],
        },
      },
    ],
    category: "Jokers",
  },
  {
    id: "shuffle_jokers",
    label: "Shuffle Jokers",
    description: "Shuffle all jokers",
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [],
    category: "Jokers",
  },
  {
    id: "redeem_voucher",
    label: "Redeem Voucher",
    description: "Redeem a specific or random voucher",
    applicableTriggers: [
      ...GENERIC_TRIGGERS.filter((trigger) => {
        return ![
          "card_scored",
          "hand_played",
          "hand_drawn",
          "card_discarded",
          "hand_discarded",
          "first_hand_drawn",
          "after_hand_played",
          "before_hand_played",
          "card_held_in_hand",
          "card_held_in_hand_end_of_round",
        ].includes(trigger); // redeeming a voucher while in blind is buggy adding vouchers to other cards in play etc.
      }),
    ],
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
    id: "create_consumable",
    label: "Create Consumable",
    description:
      "Create consumable cards and add them to your consumables area",
    applicableTriggers: [...GENERIC_TRIGGERS],
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
      },
      {
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
      },
      {
        id: "is_negative",
        type: "select",
        label: "Edition",
        options: [
          { value: "n", label: "No Edition" },
          { value: "y", label: "Negative Edition" },
        ],
        default: "n",
      },
      {
        id: "count",
        type: "number",
        label: "Number of Cards",
        default: 1,
        min: 1,
        max: 5,
      },
      {
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
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [
      {
        id: "consumable_type",
        type: "select",
        label: "Consumable Type",
        options: [
          { value: "random", label: "Random Type" },
          ...CONSUMABLE_TYPES,
        ],
        default: "random",
      },
      {
        id: "specific_card",
        type: "select",
        label: "Specific Card",
        options: [
          { value: "random", label: "Random Card" },
          ...ALL_CONSUMABLES,
        ],
        showWhen: {
          parameter: "consumable_type",
          values: ["tarot", "planet", "spectral"],
        },
      },
    ],
    category: "Consumables",
  },
  {
    id: "copy_consumable",
    label: "Copy Consumable",
    description: "Copy an existing consumable card from your collection",
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [
      {
        id: "consumable_type",
        type: "select",
        label: "Consumable Type",
        options: [
          { value: "random", label: "Random Type" },
          ...CONSUMABLE_TYPES,
        ],
        default: "random",
      },
      {
        id: "specific_card",
        type: "select",
        label: "Specific Card",
        options: [
          { value: "random", label: "Random Card" },
          ...ALL_CONSUMABLES,
        ],
        showWhen: {
          parameter: "consumable_type",
          values: ["tarot", "planet", "spectral"],
        },
      },
      {
        id: "is_negative",
        type: "select",
        label: "Edition",
        options: [
          { value: "none", label: "No Edition" },
          { value: "negative", label: "Negative Edition" },
        ],
        default: "none",
      },
    ],
    category: "Consumables",
  },
  {
    id: "permanent_bonus",
    label: "Add Permanent Bonus",
    description:
      "Add permanent bonuses to the triggered card (like Hiker joker)",
    applicableTriggers: ["card_scored"],
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
    id: "set_ante",
    label: "Set Ante Level",
    description: "Modify the current ante level",
    applicableTriggers: [...GENERIC_TRIGGERS],
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
    id: "create_tag",
    label: "Create Tag",
    description: "Create a specific or random tag",
    applicableTriggers: [...GENERIC_TRIGGERS],
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
    id: "destroy_self",
    label: "Destroy Self",
    description: "Destroy this joker",
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [{
      id: "animation",
      type: "select",
      label: "Animation",
      options: [
          { value: "start_dissolve", label: "Dissolve" },
          { value: "shatter", label: "Shatter" },
          { value: "explode", label: "Explode" },
        ],
      default : "start_dissolve",},{
      id: "display_message",
      type: "select",
      label: "Show Message",
      options: [
          { value: "y", label: "Yes" },
          { value: "n", label: "No" },
        ],
      default : "n",
    }],
    category: "Jokers",
  },{
    id: "disable_boss_blind",
    label: "Disable Boss Blind",
    description: "Disable the current boss blind, removing its effect",
    applicableTriggers: [...GENERIC_TRIGGERS, "passive"],
    params: [],
    category: "Game Rules",
  },
  {
    id: "beat_current_blind",
    label: "Beat Current Blind",
    description: "Instantly beat the current boss blind",
    applicableTriggers: ["after_hand_played"],
    params: [],
    category: "Game Rules",
  },
  {
    id: "edit_booster_packs",
    label: "Edit Boosters Packs",
    description: "Modify the values the of booster packs available in shop",
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [
      {
        id: "selected_type",
        type: "select",
        label: "Edit Type",
        options: [
          { value: "size", label: "Cards slots" },
          { value: "choice", label: "Choices" },
        ],
        default: "size",
      },
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
    category: "Game Rules",
  },
  {
    id: "edit_shop_slots",
    label: "Edit Shop Cards Slots",
    description: "Modify the Card slots of the shop ",
    applicableTriggers: [...GENERIC_TRIGGERS],
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
    category: "Game Rules",
  },
  {
    id: "modify_blind_requirement",
    label: "Modify Blind Requirement",
    description: "Changes the score requirement of a blind",
    applicableTriggers: [
      "blind_selected",
      "card_scored",
      "hand_played",
      "card_discarded",
      "hand_discarded",
      "card_held_in_hand",
      "joker_evaluated",
    ],
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
    id: "free_rerolls",
    label: "Free Rerolls",
    description: "Provide free shop rerolls",
    applicableTriggers: ["passive"],
    params: [
      {
        id: "value",
        type: "number",
        label: "Number of Free Rerolls",
        default: 1,
      },
    ],
    category: "Economy",
  },
  {
    id: "edit_consumable_slots",
    label: "Edit Consumable Slots",
    description: "Modify the number of consumable slots available",
    applicableTriggers: [...GENERIC_TRIGGERS, "passive"],
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
    category: "Game Rules",
  },
  {
    id: "edit_voucher_slots",
    label: "Edit Voucher Slots",
    description: "Modify the number of vouchers available in shop",
    applicableTriggers: [...GENERIC_TRIGGERS, "passive"],
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
    category: "Game Rules",
  },
  {
    id: "edit_booster_slots",
    label: "Edit Booster Slots",
    description: "Modify the number of booster packs available in shop",
    applicableTriggers: [...GENERIC_TRIGGERS, "passive"],
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
    category: "Game Rules",
  },
  {
    id: "discount_items",
    label: "Discount Items",
    description: "Reduce the cost of specific shop items",
    applicableTriggers: ["passive"],
    params: [
      {
        id: "discount_type",
        type: "select",
        label: "Discount Type",
        options: [
          { value: "planet", label: "Planet (Cards & Packs)" },
          { value: "tarot", label: "Tarot (Cards & Packs)" },
          { value: "spectral", label: "Spectral (Cards & Packs)" },
          { value: "standard", label: "Standard (Playing Cards & Packs)" },
          { value: "jokers", label: "Jokers" },
          { value: "vouchers", label: "Vouchers" },
          { value: "all_consumables", label: "All Consumables" },
          { value: "all_cards", label: "All Cards" },
          { value: "all_shop_items", label: "All Shop Items" },
        ],
        default: "planet",
      },
      {
        id: "discount_method",
        type: "select",
        label: "Discount Method",
        options: [
          { value: "flat_reduction", label: "Flat Dollar Reduction ($X off)" },
          {
            value: "percentage_reduction",
            label: "Percentage Reduction (X% off)",
          },
          { value: "make_free", label: "Make Completely Free ($0)" },
        ],
        default: "make_free",
      },
      {
        id: "discount_amount",
        type: "number",
        label: "Discount Amount",
        default: 1,
        showWhen: {
          parameter: "discount_method",
          values: ["flat_reduction", "percentage_reduction"],
        },
      },
    ],
    category: "Economy",
  },
  {
    id: "edit_joker_slots",
    label: "Edit Joker Slots",
    description: "Modify the number of joker slots available",
    applicableTriggers: [...GENERIC_TRIGGERS, "passive"],
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
      },
    ],
    category: "Game Rules",
  },
  {
    id: "balance",
    label: "Balance Chips and Mult",
    description: "Plasma Deck effect",
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "card_held_in_hand_end_of_round",
      "joker_evaluated",
      "before_hand_played",
      "after_hand_played",
    ],
    params: [],
    category: "Scoring",
  },{
      id: "swap_chips_mult",
      label: "Swap Chips and Mult",
      description: "Swap the Chips and Mult values",
      applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "card_held_in_hand_end_of_round",
      "joker_evaluated",
      "before_hand_played",
      "after_hand_played",
    ],
      params: [],
      category: "Scoring",
  },
  {
      id: "edit_card_apperance",
      label: "Edit Card Apperance",
      description: "Modify if a Card can appear or not the current Run",
      applicableTriggers: GENERIC_TRIGGERS,
      params: [
        {
            id: "key",
            type: "text",
            label: "Card Key (itemkey_key) or (itemkey_modprefix_key)",
            default: "",
          },
         {
            id: "card_apperance",
            type: "select",
            label: "Card Apperance",
            options: [
            { value: "appear", label: "Can Appear" },
            { value: "disapper", label: "Can't Appear" },
            ],
            default: "appear",
          },
        ],
      category: "Special",
    },
  {
    id: "change_suit_variable",
    label: "Change Suit Variable",
    description:
      "Change the value of a suit variable to a specific suit or random suit",
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [
      {
        id: "variable_name",
        type: "select",
        label: "Suit Variable",
        options: [], // Will be populated dynamically with suit variables
        variableTypes: ["suit"]
      },
      {
        id: "change_type",
        type: "select",
        label: "Change Type",
        options: [
          { value: "random", label: "Random Suit" },
          { value: "specific", label: "Specific Suit" },
          { value: "pool", label: "Random from Pool" },
        ],
        default: "random",
      },
      {
        id: "suit_pool",
        type: "checkbox",
        label: "Possible Suits",
        checkboxOptions: [...SUITS],
        showWhen: {
          parameter: "change_type",
          values: ["pool"],
        },
        default: [false, false, false, false]
      },
      {
        id: "specific_suit",
        type: "select",
        label: "Suit",
        options: [...SUITS],
        showWhen: {
          parameter: "change_type",
          values: ["specific"],
        },
        variableTypes: ["suit", "joker_context"]
      },
    ],
    category: "Variables",
  },
  {
    id: "reduce_flush_straight_requirements",
    label: "Reduce Flush/Straight Requirements",
    description:
      "Reduce the number of cards required to make Flushes and Straights",
    applicableTriggers: ["passive"],
    params: [
      {
        id: "reduction_value",
        type: "number",
        label: "Reduction Amount",
        default: 1,
      },
    ],
    category: "Game Rules",
  },
  {
    id: "shortcut",
    label: "Shortcut Straights",
    description:
      "Allow gaps in straights (e.g., 2, 4, 6, 8, 10 counts as a straight)",
    applicableTriggers: ["passive"],
    params: [],
    category: "Game Rules",
  },
  {
    id: "showman",
    label: "Allow Duplicate Cards (Showman)",
    description:
      "Joker, Tarot, Planet, and Spectral cards may appear multiple times",
    applicableTriggers: ["passive"],
    params: [],
    category: "Game Rules",
  },
  {
    id: "change_rank_variable",
    label: "Change Rank Variable",
    description:
      "Change the value of a rank variable to a specific rank or random rank",
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [
      {
        id: "variable_name",
        type: "select",
        label: "Rank Variable",
        options: [], // Will be populated dynamically with rank variables
        variableTypes: ["rank"]
      },
      {
        id: "change_type",
        type: "select",
        label: "Change Type",
        options: [
          { value: "random", label: "Random Rank" },
          { value: "specific", label: "Specific Rank" },
          { value: "pool", label: "Random from Pool" },
        ],
        default: "random",
      },
      {
        id: "rank_pool",
        type: "checkbox",
        label: "Possible Ranks",
        checkboxOptions: [...RANKS],
        showWhen: {
          parameter: "change_type",
          values: ["pool"],
        },
        default: [false, false, false, false, false, false, false, false, false, false, false, false]
      },
      {
        id: "specific_rank",
        type: "select",
        label: "Rank",
        options: [...RANKS],
        showWhen: {
          parameter: "change_type",
          values: ["specific"],
        },
        variableTypes: ["rank", "joker_context"]
      },
    ],
    category: "Variables",
  },
  {
    id: "change_pokerhand_variable",
    label: "Change Poker Hand Variable",
    description:
      "Change the value of a poker hand variable to a specific poker hand or random poker hand",
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [
      {
        id: "variable_name",
        type: "select",
        label: "Poker Hand Variable",
        options: [], // Will be populated dynamically with poker hand variables
        variableTypes: ["pokerhand"]
      },
      {
        id: "change_type",
        type: "select",
        label: "Change Type",
        options: [
          { value: "random", label: "Random Poker Hand" },
          { value: "pool", label: "Random from Pool" },
          { value: "specific", label: "Specific Poker Hand" },
          { value: "most_played", label: "Most Played Hand" },
          { value: "least_played", label: "Least Played Hand" },
        ],
        default: "random",
      },
      {
        id: "pokerhand_pool",
        type: "checkbox",
        label: "Possible PokerHands",
        checkboxOptions: [...POKER_HANDS],
        showWhen: {
          parameter: "change_type",
          values: ["pool"],
        },
        default: [false, false, false, false, false, false, false, false, false, false, false, false]
      },
      {
        id: "specific_pokerhand",
        type: "select",
        label: "Poker Hand",
        options: [...POKER_HANDS],
        showWhen: {
          parameter: "change_type",
          values: ["specific"],
        },
        variableTypes: ["pokerhand", "joker_context"]
      },
    ],
    category: "Variables",
  },
  {
    id: "change_joker_variable",
    label: "Change Joker Variable",
    description:
      "Change the value of a joker variable to a specific Joker key",
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [
      {
        id: "variable_name",
        type: "select",
        label: "Joker Variable",
        options: [], // Will be populated dynamically with joker variables
        variableTypes: ["joker"]
      },
      {
        id: "change_type",
        type: "select",
        label: "Change Type",
        options: [
          { value: "random", label: "Random Joker" }, 
          { value: "specific", label: "Specific Joker Key" },
        ],
        default: "specific",
        variableTypes: ["joker", "joker_context"],
      },
      {
        id: "random_type",
        type: "select",
        label: "Random from Type",
        options: [
          // { value: "all", label: "Random From All Jokers" }, --- TEMP DISABLED
          // { value: "unlocked", label: "Random from Unlocked Jokers" }, --- TEMP DISABLED
          { value: "locked", label: "Random from Locked Jokers" },
          { value: "pool", label: "Random from Pool" },
          { value: "owned", label: "Random from Owned Jokers" },
          // { value: "rarity", label: "Random from specific Rarity" }, --- TEMP DISABLED
        ],
        default: "all",
        showWhen: {
          parameter: "change_type",
          values: ["random"],
        },
      },
      {
        id: "rarity",
        type: "select",
        label: "Rarity",
        options: [...RARITIES()],
        showWhen: {
          parameter: "random_type",
          values: ["rarity"],
        },
      },
      {
        id: "joker_pool",
        type: "text",
        label: "Pool",
        options: [],
        showWhen: {
          parameter: "random_type",
          values: ["pool"],
        },
      },
      {
        id: "specific_joker",
        type: "text",
        label: "Joker Key",
        options: [],
        showWhen: {
          parameter: "change_type",
          values: ["specific"],
        },
      },
    ],
    category: "Variables",
  },
  {
    id: "combine_ranks",
    label: "Rank X Considered as Y",
    description: "Treat specified ranks as a different rank",
    applicableTriggers: ["passive"],
    params: [
      {
        id: "source_rank_type",
        type: "select",
        label: "Source Rank Type",
        options: [
          { value: "specific", label: "Specific Ranks" },
          { value: "face_cards", label: "Face Cards (J, Q, K)" },
          { value: "all", label: "All Ranks" },
        ],
        default: "specific",
        // variableTypes: ["rank"] --- TEMP DISABLED
      },
      {
        id: "source_ranks",
        type: "text",
        label: "Source Ranks (comma-separated: 2,3,J,K)",
        default: "J,Q,K",
        showWhen: {
          parameter: "source_rank_type",
          values: ["specific"],
        },
      },
      {
        id: "target_rank",
        type: "select",
        label: "Target Rank",
        options: [
          ...RANKS,
          { value: "face_cards", label: "Face Cards (J, Q, K)" },
        ],
        default: "J",
        variableTypes: ["rank"],
      },
    ],
    category: "Card Effects",
  },
  {
    id: "combine_suits",
    label: "Combine Suits",
    description: "Two suits are considered as each other (bidirectional)",
    applicableTriggers: ["passive"],
    params: [
      {
        id: "suit_1",
        type: "select",
        label: "First Suit",
        options: [...SUITS],
        default: "Spades",
        // variableTypes: ["suit"], --- TEMP DISABLED
      },
      {
        id: "suit_2",
        type: "select",
        label: "Second Suit",
        options: [...SUITS],
        default: "Hearts",
        // variableTypes: ["suit"], --- TEMP DISABLED
      },
    ],
    category: "Card Effects",
  },
  {
    id: "splash_effect",
    label: "Every Played Card is Scored (Splash)",
    description: "When a hand is played, every card in it is scored",
    applicableTriggers: ["passive"],
    params: [],
    category: "Special",
  },
  {
    id: "copy_joker_ability",
    label: "Copy Joker Ability",
    description:
      "Copy the calculate function of another joker (like Blueprint/Brainstorm)",
    applicableTriggers: ["passive"],
    params: [
      {
        id: "selection_method",
        type: "select",
        label: "Target Joker",
        options: [
          { value: "right", label: "Joker to the Right" },
          { value: "left", label: "Joker to the Left" },
          { value: "specific", label: "Specific Position" },
        ],
        default: "right",
        variableTypes: ["joker"]
      },
      {
        id: "specific_index",
        type: "number",
        label: "Joker Position (1-5)",
        default: 1,
        showWhen: {
          parameter: "selection_method",
          values: ["specific"],
        },
      },
    ],
    category: "Jokers",
  },
  {
    id: "prevent_game_over",
    label: "Prevent Game Over",
    description:
      "Prevent the run from ending when game over conditions are met (like Mr. Bones)",
    applicableTriggers: ["game_over"],
    params: [],
    category: "Special",
  },
  {
    id: "force_game_over",
    label: "Force Game Over",
    description: "Forces the run to end (ignores Mr. Bones)",
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [],
    category: "Special",
  },
        {
      id: "Win_blind",
      label: "Win Current Blind",
      description: "Forces to Win the current Blind",
      applicableTriggers: [...GENERIC_TRIGGERS],
      params: [],
      category: "Special",
    },
  {
    id: "juice_up_joker",
    label: "Juice Up The Joker",
    description: "Make the joker play a animation",
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [
      {
        id: "mode",
        type: "select",
        label: "Juice Up Mode",
        options: [
          { value: "constant", label: "Constant" },
          { value: "onetime", label: "One-time" },
        ],
        default: "constant",
      },
      {
        id: "scale",
        type: "number",
        label: "Scale",
        min: 0,
        default: 1,
      },
      {
        id: "rotation",
        type: "number",
        label: "Rotation",
        min: 0,
        default: 1,
      },
    ],
    category: "Special",
  },
  {
    id: "juice_up_card",
    label: "Juice Up The Card",
    description: "Make the Card play a animation",
    applicableTriggers: ["card_scored", "card_held_in_hand"],
    params: [
      {
        id: "mode",
        type: "select",
        label: "Juice Up Mode",
        options: [
          { value: "constant", label: "Constant" },
          { value: "onetime", label: "One-time" },
        ],
        default: "constant",
      },
      {
        id: "scale",
        type: "number",
        label: "Scale",
        min: 0,
        default: 1,
      },
      {
        id: "rotation",
        type: "number",
        label: "Rotation",
        min: 0,
        default: 1,
      },
    ],
    category: "Special",
  },
  {
    id: "show_message",
    label: "Show Message",
    description: "Display a custom message with specified color",
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [
      {
        id: "colour",
        type: "select",
        label: "Message Color",
        options: [
          { value: "G.C.WHITE", label: "White" },
          { value: "G.C.RED", label: "Red" },
          { value: "G.C.GREEN", label: "Green" },
          { value: "G.C.BLUE", label: "Blue" },
          { value: "G.C.YELLOW", label: "Yellow" },
          { value: "G.C.PURPLE", label: "Purple" },
          { value: "G.C.ORANGE", label: "Orange" },
          { value: "G.C.BLACK", label: "Black" },
          { value: "G.C.CHIPS", label: "Chips (Blue)" },
          { value: "G.C.MULT", label: "Mult (Red)" },
          { value: "G.C.MONEY", label: "Money (Yellow)" },
        ],
        default: "G.C.WHITE",
      },
    ],
    category: "Special",
  },
  {
    id: "emit_flag",
    label: "Emit Flag",
    description:
      "Emit a custom flag. Flags are global variables that can be set to true or false and checked by any other jokers",
    applicableTriggers: [...GENERIC_TRIGGERS],
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
      {
      id: "display_message",
      type: "select",
      label: "Show Message",
      options: [
          { value: "y", label: "Yes" },
          { value: "n", label: "No" },
        ],
      default : "n",
    },
    ],
    category: "Special",
  },
  {
    id: "play_sound",
    label: "Play a sound",
    description: "Play a specific sound defined in the Sound Tab",
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [
      {
        id: "sound_key",
        type: "text",
        label: "Sound Key (modprefix_key) or (key)",
        default: "",
      },
    ],
    category: "Special",
  },
  {
    id: "fix_probability",
    label: "Set Probability",
    description: "Set the Numerator or the Denominator of a chance roll",
    applicableTriggers: ["change_probability"],
    params: [
      {
        id: "part",
        type: "select",
        label: "Numerator or Denominator",
        options: [
          { value: "numerator", label: "Numerator" },
          { value: "denominator", label: "Denominator" },
          { value: "both", label: "Both" },
        ],
        default: "numerator",
      },
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 1,
        min: 0,
      },
    ],
    category: "Probability",
  },
  {
    id: "mod_probability",
    label: "Modify Probability",
    description: "Modify the Numerator or the Denominator of a chance roll",
    applicableTriggers: ["change_probability"],
    params: [
      {
        id: "part",
        type: "select",
        label: "Numerator or Denominator",
        options: [
          { value: "numerator", label: "Numerator" },
          { value: "denominator", label: "Denominator" },
        ],
        default: "numerator",
      },
      {
        id: "operation",
        type: "select",
        label: "Operation",
        options: [
          { value: "increment", label: "Increment by value" },
          { value: "decrement", label: "Decrement by value" },
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
    category: "Probability",
  },
  {
    id: "crash_game",
    label: "Crash the Game",
    description: "Crash the Game with a Custom message",
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [],
    category: "Special",
  },
];

export function getEffectTypeById(
  id: string
): EffectTypeDefinition | undefined {
  return EFFECT_TYPES.find((effectType) => effectType.id === id);
}

export function getEffectsForTrigger(
  triggerId: string
): EffectTypeDefinition[] {
  return EFFECT_TYPES.filter(
    (effect) =>
      effect.applicableTriggers && effect.applicableTriggers.includes(triggerId)
  );
}
