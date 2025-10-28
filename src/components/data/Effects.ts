import {
  ChartBarIcon,
  BanknotesIcon,
  RectangleStackIcon,
  Cog6ToothIcon,
  SparklesIcon,
  PencilSquareIcon,
  CakeIcon,
  VariableIcon,
  CursorArrowRaysIcon,
} from "@heroicons/react/24/outline";
import { CategoryDefinition } from "./Triggers";
import { GlobalEffectTypeDefinition } from "../ruleBuilder/types";
import { CONSUMABLE_SETS, CUSTOM_CONSUMABLES, EDITIONS, ENHANCEMENTS, PLANET_CARDS, POKER_HANDS, CONSUMABLE_TYPES, RANKS, RARITIES, SEALS, SPECTRAL_CARDS, STICKERS, ALL_CONSUMABLES, SUITS, TAGS, TAROT_CARDS, VOUCHERS } from "./BalatroUtils";
import { GENERIC_TRIGGERS,ALL_OBJECTS } from "./Conditions";

export const EFFECT_CATEGORIES: CategoryDefinition[] = [
  {
    label: "Selected Cards",
    icon: CursorArrowRaysIcon,
  },
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
    icon: RectangleStackIcon,
  },
  {
    label: "Game Rules",
    icon: Cog6ToothIcon,
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

export const EFFECTS: GlobalEffectTypeDefinition[] = [
  {
    id: "add_chips",
    label: "Add Chips",
    description: "Add a flat amount of chips to the hand score",
    objectUsers: ["joker", "consumable", "card"],
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "card_discarded",
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
    objectUsers: ["joker", "consumable", "card"],
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "card_discarded",
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
    objectUsers: ["joker", "consumable", "card"],
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "card_discarded",
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
    objectUsers: ["joker", "consumable", "card"],
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "card_discarded",
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
    objectUsers: ["joker", "consumable", "card"],
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "card_discarded",
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
    objectUsers: ["joker", "consumable", "card"],
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "card_discarded",
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
    objectUsers: ["joker", "consumable", "card"],
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "card_discarded",
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
    objectUsers: ["joker", "consumable", "card"],
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "card_discarded",
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
    objectUsers: [...ALL_OBJECTS],
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
    id: "retrigger_cards",
    label: "Retrigger",
    description: "Retrigger the scored/activated card",
    objectUsers: ["joker"],
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
    objectUsers: ["joker", "consumable", "card"],
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
      objectUsers: [...ALL_OBJECTS],
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
    objectUsers: [...ALL_OBJECTS],
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
    objectUsers: [...ALL_OBJECTS],
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
    objectUsers: ["joker", "consumable", "card"],
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
    objectUsers: [...ALL_OBJECTS],
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
    objectUsers: [...ALL_OBJECTS],
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
    objectUsers: ["joker", "card"],
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
    objectUsers: ["joker"],
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
    id: "add_card_to_hand",
    label: "Add Card to Hand",
    description: "Create a new playing card and add it to your hand",
    applicableTriggers: [...GENERIC_TRIGGERS],
    objectUsers: ["joker"],
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
    id: "edit_win_ante",
      label: "Set Winner Ante",
        description: "Set the Final Ante where the Player Win's the Game",
        applicableTriggers: [...GENERIC_TRIGGERS],
        objectUsers: ["consumable", "deck", "joker", "voucher"],
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
    objectUsers: ["joker"],
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
      },
      {
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
    objectUsers: [...ALL_OBJECTS],
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
    objectUsers: ["joker", "consumable", "card"],
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
    objectUsers: ["joker", "consumable", "card"],
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
    id: "flip_joker",
    label: "Flip Joker",
    description: "Flip a joker",
    applicableTriggers: [...GENERIC_TRIGGERS],
    objectUsers: ["joker", "consumable"],
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
    objectUsers: ["joker", "consumable"],
    params: [],
    category: "Jokers",
  },
  {
    id: "create_consumable",
    label: "Create Consumable",
    description:
      "Create consumable cards and add them to your consumables area",
    applicableTriggers: [...GENERIC_TRIGGERS],
    objectUsers: ["joker", "consumable", "card", "deck"],
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
    id: "set_ante",
    label: "Set Ante Level",
    description: "Modify the current ante level",
    applicableTriggers: [...GENERIC_TRIGGERS],
    objectUsers: ["joker", "consumable", "voucher", "deck"],
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
    id: "destroy_self",
    label: "Destroy Self",
    description: "Destroy this joker",
    applicableTriggers: [...GENERIC_TRIGGERS],
    objectUsers: ["joker", "card"],
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
      exemptObjects: ["card"]
    }],
    category: "Jokers",
  },
  {
    id: "create_tag",
    label: "Create Tag",
    description: "Create a specific or random tag",
    applicableTriggers: [...GENERIC_TRIGGERS],
    objectUsers: [...ALL_OBJECTS],
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
    id: "create_last_played_planet",
    label: "Create Last Played Planet",
    description: "Create a Planet card corresponding to the last hand played (Blue Seal effect)",
    objectUsers: ["card"],
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
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
    id: "destroy_consumable",
    label: "Destroy Consumable",
    description: "Destroy a consumable card from your collection",
    applicableTriggers: [...GENERIC_TRIGGERS],
    objectUsers: ["joker", "consumable", "card"],
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
    id: "destroy_cards",
    label: "Destroy Cards",
    description: "Destroy a number of random cards from hand",
    objectUsers: ["consumable"],
    applicableTriggers: ["consumable_used", "held_hand"],
    params: [
      {
        id: "method",
        type: "select",
        label: "Selection Method",
        options: [
          { value: 'random', label: 'Random'},
        ],
        default: 'random',
      },
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
    id: "permanent_bonus",
    label: "Add Permanent Bonus",
    description:
      "Add permanent bonuses to the triggered card (like Hiker joker)",
    applicableTriggers: ["card_scored"],
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
    id: "copy_consumable",
    label: "Copy Consumable",
    description: "Copy an existing consumable card from your collection",
    applicableTriggers: [...GENERIC_TRIGGERS],
    objectUsers: ["joker", "card"],
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
    id: "disable_boss_blind",
    label: "Disable Boss Blind",
    description: "Disable the current boss blind, removing its effect",
    applicableTriggers: [...GENERIC_TRIGGERS, "passive"],
    objectUsers: ["joker", "consumable"],
    params: [],
    category: "Game Rules",
  },
  {
    id: "beat_current_blind",
    label: "Beat Current Blind",
    description: "Instantly beat the current boss blind",
    applicableTriggers: ["after_hand_played"],
    objectUsers: ["joker"],
    params: [],
    category: "Game Rules",
  },
  {
    id: "edit_booster_packs",
    label: "Edit Boosters Packs",
    description: "Modify the values the of booster packs available in shop",
    applicableTriggers: [...GENERIC_TRIGGERS],
    objectUsers: ["joker", "consumable", "voucher"],
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
    objectUsers: ["joker", "consumable", "voucher"],
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
    objectUsers: ["joker", "consumable"],
    applicableTriggers: [
      "blind_selected",
      "card_scored",
      "hand_played",
      "card_discarded",
      "hand_discarded",
      "card_held_in_hand",
      "consumable_used",
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
    id: "edit_consumable_slots",
    label: "Edit Consumable Slots",
    description: "Modify the number of consumable slots available",
    applicableTriggers: [...GENERIC_TRIGGERS, "passive"],
    objectUsers: [...ALL_OBJECTS],
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
    objectUsers: [...ALL_OBJECTS],
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
    objectUsers: [...ALL_OBJECTS],
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
    id: "edit_joker_slots",
    label: "Edit Joker Slots",
    description: "Modify the number of joker slots available",
    applicableTriggers: [...GENERIC_TRIGGERS, "passive"],
    objectUsers: [...ALL_OBJECTS],
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
    objectUsers: ["joker", "consumable"],
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
    id: "edit_card_apperance",
    label: "Edit Card Apperance",
    description: "Modify if a Card can appear or not the current Run",
    applicableTriggers: GENERIC_TRIGGERS,
    objectUsers: [...ALL_OBJECTS],
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
    objectUsers: ["joker", "card"],
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
    id: "change_rank_variable",
    label: "Change Rank Variable",
    description:
      "Change the value of a rank variable to a specific rank or random rank",
    applicableTriggers: [...GENERIC_TRIGGERS],
    objectUsers: ["joker"],
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
    objectUsers: ["joker", "card"],
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
    objectUsers: ["joker"],
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
    id: "prevent_game_over",
    label: "Prevent Game Over",
    description:
      "Prevent the run from ending when game over effects are met (like Mr. Bones)",
    applicableTriggers: ["game_over"],
    objectUsers: ["joker"],
    params: [],
    category: "Special",
  },
  {
    id: "force_game_over",
    label: "Force Game Over",
    description: "Forces the run to end (ignores Mr. Bones)",
    applicableTriggers: [...GENERIC_TRIGGERS],
    objectUsers: ["joker", "consumable"],
    params: [],
    category: "Special",
  },
  {
    id: "Win_blind",
    label: "Win Current Blind",
    description: "Forces to Win the current Blind",
    applicableTriggers: [...GENERIC_TRIGGERS],
    objectUsers: ["joker", "consumable"],
    params: [],
    category: "Special",
  },
  {
    id: "juice_up_joker",
    label: "Juice Up The Joker",
    description: "Make the joker play a animation",
    applicableTriggers: [...GENERIC_TRIGGERS],
    objectUsers: ["joker"],
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
    objectUsers: ["joker"],
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
    objectUsers: ["joker", "card"],
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
    objectUsers: ["joker", "consumable"],
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
    objectUsers: [...ALL_OBJECTS],
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
    id: "crash_game",
    label: "Crash the Game",
    description: "Crash the Game with a Custom message",
    applicableTriggers: [...GENERIC_TRIGGERS],
    objectUsers: ["joker", "consumable", "card"],
    params: [],
    category: "Special",
  },
  {
    id: "balance_chips_mult",
    label: "Balance Chips and Mult",
    description: "Plasma Deck effect",
    objectUsers: ["joker", "card"],
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
    id: "swap_chips_mult",
    label: "Swap Chips and Mult",
    description: "Swap the Chips and Mult values",
    objectUsers: ["joker", "card"],
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
    id: "convert_all_cards_to_suit",
    label: "Convert All Cards to Suit",
    description: "Convert all cards in hand to a specific suit",
    objectUsers: ["consumable"],
    applicableTriggers: ["consumable_used", "held_hand"],
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
    applicableTriggers: ["consumable_used", "held_hand"],
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
    category: "Card Effects",
  },
  {
    id: "convert_left_to_right",
    label: "Convert Left to Right",
    description: "Convert all selected cards to match the rightmost selected card (like Death tarot)",
    objectUsers: ["consumable"],
    applicableTriggers: ["consumable_used"],
    params: [],
    category: "Selected Cards",
  },
  {
    id: "fix_probability",
    label: "Set Probability",
    description: "Set the Numerator or the Denominator of a chance roll",
    objectUsers: ["joker"],
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
    objectUsers: ["joker"],
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
    id: "fool_effect",
    label: "Create Last Used Consumable",
    description: "Create a copy of the last Tarot or Planet card that was used (like The Fool)",
    objectUsers: ['consumable'],
    applicableTriggers: ["consumable_used", "held_hand"],
    params: [],
    category: "Consumables",
  },
  {
    id: "increment_rank",
    label: "Increment/Decrement Rank",
    description: "Increase or decrease the rank of selected cards by a specified amount",
    objectUsers: ['consumable'],
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
    id: "discount_items",
    label: "Discount Items",
    description: "Reduce the cost of specific shop items",
    objectUsers: ["joker", "voucher"],
    applicableTriggers: ["passive", "card_used"],
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
    id: "edit_all_starting_cards",
    label: "Edit All Starting Cards",
    description: "Apply multiple modifications to the starting cards in the deck (enhancement, seal, edition, suit, rank)",
    objectUsers: ["deck"],
    applicableTriggers: ["card_used"],
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
    applicableTriggers: ["card_used"],
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
    applicableTriggers: ["card_used"],
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
    id: "edit_joker",
    label: "Apply Edition to Random Joker",
    description: "Apply an edition to random jokers in your joker area",
    objectUsers: ["consumable"],
    applicableTriggers: ["consumable_used", "held_hand"],
    params: [
      {
        id: "method",
        type: "select",
        label: "Selection Method",
        options: [
          {value: "random", label: "Random"}
        ],
        default: "random",
      },
      {
        id: "amount",
        type: "number",
        label: "Number of Jokers to Edit",
        default: 1,
        min: 1,
        max: 5,
        showWhen: {parameter: "method", values: ["random"]},
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
          { value: "none", label: "No Change" },
          { value: "random", label: "Random Edition" },
          { value: "remove", label: "Remove Edition" },
        ],
        default: "none",
      },
      {
        id: "sticker",
        type: "select",
        label: "Sticker",
        options: [
          ...STICKERS.map((sticker) => ({
            key: sticker.key,
            value: sticker.value,
            label: sticker.label,
          })),
        { value: "none", label: "No Change" },
        { value: "remove", label: "Remove Sticker" },
        ],
        default: "none",
      },
    ],
    category: "Jokers",
  },
]

export function getEffectTypeById(
  id: string
): GlobalEffectTypeDefinition | undefined {
  return EFFECTS.find((effectType) => effectType.id === id);
}

export function getEffectsForTrigger(
  triggerId: string,
  itemType: string,
): GlobalEffectTypeDefinition[] {
  if (itemType === "enhancement" || itemType === "edition" || itemType === "seal") {
    itemType = "card"
  }
  return EFFECTS.filter((effect) =>
    effect.applicableTriggers && 
    effect.applicableTriggers.includes(triggerId) &&
    effect.objectUsers.includes(itemType)
  );
}
