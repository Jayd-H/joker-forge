import {
  ChartBarIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  SparklesIcon,
  PencilSquareIcon,
  CakeIcon,
  VariableIcon,
  ReceiptPercentIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  PlayIcon
} from "@heroicons/react/24/outline";
import { CategoryDefinition } from "./Triggers";
import { GlobalEffectTypeDefinition } from "../ruleBuilder/types";
import { POKER_HANDS, RANKS, SUITS, TAGS, VOUCHERS } from "./BalatroUtils";
import { GENERIC_TRIGGERS, ALL_OBJECTS } from "./Conditions";
import { FolderIcon } from "@heroicons/react/24/outline";
import { VARIABLE_EFFECTS } from "./effectData/Variables";
import { STARTING_DECK_EFFECTS } from "./effectData/StartingDeck";
import { SCORING_EFFECTS } from "./effectData/Scoring";
import { JOKER_EFFECTS } from "./effectData/Jokers";
import { CONSUMABLE_EFFECTS } from "./effectData/Consumables";
import { PLAYING_CARD_EFFECTS } from "./effectData/PlayingCard";
import { BLIND_AND_ANTE_EFFECTS } from "./effectData/BlindAndAnte";

export const EFFECT_CATEGORIES: CategoryDefinition[] = [
  {
    label: "Deck Card Modifications",
    icon: FolderIcon,
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
    label: "Blind & Ante",
    icon: PlayIcon,
  },
  {
    label: "Jokers",
    icon: UserGroupIcon,
  },
  {
    label: "Consumables",
    icon: CakeIcon,
  },
  {
    label: "Shop",
    icon: ShoppingBagIcon
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
    label: "Probability",
    icon: ReceiptPercentIcon,
  },
  {
    label: "Special",
    icon: SparklesIcon,
  },
];

export const EFFECTS: GlobalEffectTypeDefinition[] = [
  {
    id: "set_dollars",
    label: "Edit Dollars",
    description: "Modify your money balance",
    applicableTriggers: [...GENERIC_TRIGGERS, "card_used"],
    objectUsers: [...ALL_OBJECTS],
    params: [
      {
        id: "operation",
        type: "select",
        label: "Operation",
        options: [
          { value: "add", label: "Add" },
          { value: "subtract", label: "Subtract" },
          { value: "multiply", label: "Multiply By" },
          { value: "divide", label: "Divide By" },
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
      {
        id: "limit_dollars",
        type: "checkbox",
        label: "Limit Earnings?",
        checkboxOptions: [
          {value: "min_e", label: "Minimum Earnings"}, 
          {value: "max_e", label: "Maximum Earnings"}, 
          {value: "min_f", label: "Minimum Final Amount"}, 
          {value: "max_f", label: "Maximum Final Amount"}, 
        ],
        default: [false, false, false, false],
        showWhen: {parameter: "operation", values: ["add", "subtract", "multiply", "divide"]}
      },
      {
        id: "min_earnings",
        type: "number",
        label: "Min Earnings",
        default: 0,
        showWhen: {parameter: "limit_dollars", values: ['0']}
      },
      {
        id: "max_earnings",
        type: "number",
        label: "Max Earnings",
        default: 20,
        showWhen: {parameter: "limit_dollars", values: ['1']}
      },
      {
        id: "min_total",
        type: "number",
        label: "Min Total",
        default: 0,
        showWhen: {parameter: "limit_dollars", values: ['2']}
      },
      {
        id: "max_total",
        type: "number",
        label: "Max Total",
        default: 25,
        showWhen: {parameter: "limit_dollars", values: ['3']}
      }
    ],
    category: "Economy",
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
    id: "edit_hands",
    label: "Edit Hands",
    description: "Modify the number of hands available",
    applicableTriggers: [...GENERIC_TRIGGERS, "passive", "card_used"],
    objectUsers: ["joker", "consumable", "voucher", "deck"],
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
          { value: "round", label: "This Round", exempt: ["voucher", "deck"]},
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
    id: "edit_discards",
    label: "Edit Discards",
    description: "Modify the number of discards available",
    applicableTriggers: [...GENERIC_TRIGGERS, "passive", "card_used"],
    objectUsers: ["joker", "consumable", "voucher", "deck"],
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
          { value: "round", label: "This Round", exempt: ["voucher", "deck"]},
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
    applicableTriggers: [...GENERIC_TRIGGERS, "passive", "card_used"],
    objectUsers: ["joker", "consumable", "voucher", "deck"],
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
    id: "edit_play_size",
    label: "Edit Play Size",
    description:
      "Modify the Play size (number of cards you can select and Play)",
    applicableTriggers: [...GENERIC_TRIGGERS, "passive", "card_used"],
    objectUsers: ["joker", "consumable", "voucher", "deck"],
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
    applicableTriggers: [...GENERIC_TRIGGERS, "passive", "card_used"],
    objectUsers: ["joker", "consumable", "voucher", "deck"],
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
          { value: "keyvar", label: "Key Variable" },
        ],
        default: "random",
      },
      {
        id: "variable",
        type: "select",
        label: "Key Variable",
        options: [],
        showWhen: {
          parameter: "tag_type",
          values: ["keyvar"],
        },
        variableTypes: ["key"],
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
    id: "edit_booster_packs",
    label: "Edit Boosters Packs",
    description: "Modify the values the of booster packs available in shop",
    applicableTriggers: [...GENERIC_TRIGGERS, "card_used"],
    objectUsers: ["joker", "consumable", "voucher", "decks"],
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
    category: "Shop",
  },
  {
    id: "edit_shop_slots",
    label: "Edit Shop Cards Slots",
    description: "Modify the Card slots of the shop ",
    applicableTriggers: [...GENERIC_TRIGGERS, "passive", "card_used"],
    objectUsers: ["joker", "consumable", "voucher", "deck"],
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
    category: "Shop",
  },
  {
    id: "edit_consumable_slots",
    label: "Edit Consumable Slots",
    description: "Modify the number of consumable slots available",
    applicableTriggers: [...GENERIC_TRIGGERS, "passive", "card_used"],
    objectUsers: ["joker", "voucher", "deck"],
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
    category: "Consumables",
  },
  {
    id: "edit_voucher_slots",
    label: "Edit Voucher Slots",
    description: "Modify the number of vouchers available in shop",
    applicableTriggers: [...GENERIC_TRIGGERS, "passive", "card_used"],
    objectUsers: ["joker", "consumable", "voucher", "deck"],
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
    category: "Shop",
  },
  {
    id: "edit_booster_slots",
    label: "Edit Booster Slots",
    description: "Modify the number of booster packs available in shop",
    applicableTriggers: [...GENERIC_TRIGGERS, "passive", "card_used"],
    objectUsers: ["joker", "consumable", "voucher", "deck"],
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
    category: "Shop",
  },
  {
    id: "edit_joker_slots",
    label: "Edit Joker Slots",
    description: "Modify the number of joker slots available",
    applicableTriggers: [...GENERIC_TRIGGERS, "passive", "card_used"],
    objectUsers: ["joker", "consumable", "voucher", "deck"],
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
    category: "Jokers",
  },
  {
    id: "edit_joker_size",
    label: "Edit Joker Selection Size",
    description: "Modify the number of Jokers that the player can Select/Highlight at once",
    applicableTriggers: [...GENERIC_TRIGGERS, "passive", "card_used"],
    objectUsers: ["joker", "consumable", "voucher", "deck"],
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
    objectUsers: ["joker", "consumable"],
    params: [
      {
        id: "voucher_type",
        type: "select",
        label: "Voucher Type",
        options: [
          { value: "random", label: "Random Voucher" },
          { value: "specific", label: "Specific Voucher" },
          { value: "keyvar", label: "Key Variable" },
        ],
        default: "random",
      },
      {
        id: "variable",
        type: "select",
        label: "Key Variable",
        options: [],
        showWhen: {
          parameter: "voucher_type",
          values: ["keyvar"],
        },
        variableTypes: ["key"],
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
    id: "edit_card_appearance",
    label: "Edit Card Appearance",
    description: "Modify if a Card can appear or not the current Run",
    applicableTriggers: [...GENERIC_TRIGGERS, "card_used"],
    objectUsers: ["joker", "consumable", "voucher", "deck"],
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
    category: "Shop",
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
    id: "splash_effect",
    label: "Every Played Card is Scored (Splash)",
    objectUsers: ["joker"],
    description: "When a hand is played, every card in it is scored",
    applicableTriggers: ["passive"],
    params: [],
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
        id: "message_type",
        type: "select",
        label: "Message Type",
        options: [
          { value: "text", label: "Custom Text"},
          { value: "variable", label: "Text Variable"},
        ],
        default: "text",
      },
      {
        id: "text_var",
        type: "select",
        label: "Text Variable",
        options: [],
        variableTypes: ["text"],
        showWhen: {parameter: "message_type", values: ["variable"]}
      },
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
    applicableTriggers: [...GENERIC_TRIGGERS, "card_used"],
    objectUsers: [...ALL_OBJECTS],
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
    applicableTriggers: [...GENERIC_TRIGGERS, "card_used"],
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
    category: "Shop",
  },
  {
    id: "edit_rerolls",
    label: "Edit Reroll Price",
    description: "Modify the price of the shop Reroll",
    objectUsers: ["voucher", "deck"],
    applicableTriggers: ["card_used"],
    params: [
      {
        id: "operation",
        type: "select",
        label: "Operation",
        options: [
          { value: "add", label: "Add" },
          { value: "subtract", label: "Subtract" },
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
    category: "Shop",
  },
  {
    id: "free_rerolls",
    label: "Free Rerolls",
    description: "Provide free shop rerolls",
    objectUsers: ["joker", "voucher"],
    applicableTriggers: ["card_used", "passive"],
    params: [
      {
        id: "value",
        type: "number",
        label: "Number of Free Rerolls",
        default: 1,
      },
    ],
    category: "Shop",
  },
  {
    id: "allow_debt",
    label: "Allow Debt",
    description: "Allow the player to go into debt by a specified amount",
    objectUsers: ["joker"],
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
    id: "shortcut",
    label: "Shortcut Straights",
    description: "Allow gaps in straights (e.g., 2, 4, 6, 8, 10 counts as a straight)",
    objectUsers: ["joker"],
    applicableTriggers: ["passive"],
    params: [],
    category: "Game Rules",
  },
  {
    id: "showman",
    label: "Allow Duplicate Cards (Showman)",
    description: "Joker, Tarot, Planet, and Spectral cards may appear multiple times",
    objectUsers: ["joker"],
    applicableTriggers: ["passive"],
    params: [],
    category: "Game Rules",
  },
  {
    id: "reduce_flush_straight_requirements",
    label: "Reduce Flush/Straight Requirements",
    description: "Reduce the number of cards required to make Flushes and Straights",
    objectUsers: ["joker"],
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
    id: "combine_ranks",
    label: "Rank X Considered as Y",
    description: "Treat specified ranks as a different rank",
    objectUsers: ["joker"],
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
    objectUsers: ["joker"],
    applicableTriggers: ["passive"],
    params: [
      {
        id: "suit_1",
        type: "select",
        label: "First Suit",
        options: [...SUITS],
        default: "Spades",
      },
      {
        id: "suit_2",
        type: "select",
        label: "Second Suit",
        options: [...SUITS],
        default: "Hearts",
      },
    ],
    category: "Card Effects",
  },
  {
    id: "edit_hands_money",
    label: "Edit Hand Money",
    description: "Add, subtract, or set the player's end of the round hand money",
    objectUsers: ["voucher", "deck"],
    applicableTriggers: ["card_used"],
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
    category: "Economy",
  },
  {
    id: "edit_discards_money",
    label: "Edit Discard Money",
    description: "set the player's end of the round discard money",
    objectUsers: ["voucher", "deck"],
    applicableTriggers: ["card_used"],
    params: [
      {
        id: "operation",
        type: "select",
        label: "Operation",
        options: [{ value: "set", label: "Set" }],
        default: "set",
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
    category: "Economy",
  },
  {
    id: "edit_interest_cap",
    label: "Edit Interest Cap",
    description: "Modify the Cap on Interest Earned in each round",
    objectUsers: ["voucher", "deck"],
    applicableTriggers: ["card_used"],
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
    category: "Economy",
  },
  {
    id: "edit_rarity_weight",
    label: "Edit Rarity Weight",
    description: "Modify the Rate Probability for Joker Rarities in the Shop",
    objectUsers: ["voucher", "deck"],
    applicableTriggers: ["card_used"],
    params: [
      {
          id: "key_rarity",
          type: "text",
          label: "Joker Rarity Key (key)",
          default: "",
        },
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
          default: "add",
        },
        {
          id: "value",
          type: "number",
          label: "Amount",
          default: 1,
          min: 1,
        },
      ],
    category: "Shop",
  },
  {
    id: "edit_item_weight",
    label: "Edit Card Weight",
    description: "Modify the Rate Probability for Shop Cards",
    objectUsers: ["voucher", "deck"],
    applicableTriggers: ["card_used"],
    params: [
      {
          id: "key",
          type: "text",
          label: "Card Key (key)",
          default: "",
        },
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
          default: "add",
        },
        {
          id: "value",
          type: "number",
          label: "Amount",
          default: 1,
          min: 1,
        },
      ],
    category: "Shop",
  },
  ...SCORING_EFFECTS,
  ...JOKER_EFFECTS,
  ...CONSUMABLE_EFFECTS,
  ...PLAYING_CARD_EFFECTS,
  ...BLIND_AND_ANTE_EFFECTS,
  ...VARIABLE_EFFECTS,
  ...STARTING_DECK_EFFECTS,
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
