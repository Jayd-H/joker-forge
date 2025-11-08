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
  PlayIcon,
  TicketIcon
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
import { ECONOMY_EFFECTS } from "./effectData/Economy";
import { SHOP_EFFECTS } from "./effectData/Shop";
import { GAME_RULE_EFFECTS } from "./effectData/GameRules";

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
    label: "Vouchers & Tags",
    icon: TicketIcon,
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
    id: "level_up_hand",
    label: "Level Up Hand",
    description: "Increase the level of a poker hand",
    applicableTriggers: [...GENERIC_TRIGGERS, "card_used"],
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
    id: "create_tag",
    label: "Create Tag",
    description: "Create a specific or random tag",
    applicableTriggers: [...GENERIC_TRIGGERS, "card_used"],
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
    category: "Vouchers & Tags",
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
      "card_used",
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
    category: "Vouchers & Tags",
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
    id: "special_message",
    label: "Show Special Message",
    description: "Display a custom special message with specified paramters (like the nope message)",
    objectUsers: ["consumable"],
    applicableTriggers: ["card_used", "held_hand"],
    params: [
      {
        id: "colour",
        type: "select",
        label: "Background Color",
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
          { value: "G.C.SECONDARY_SET.Tarot", label: "Consumable (Tarot)" },
          { value: "G.C.SECONDARY_SET.Planet", label: "Consumable (Planet)" },
          { value: "G.C.SECONDARY_SET.Spectral", label: "Consumable (Spectral)" },
        ],
        default: "G.C.SECONDARY_SET.Tarot",
      },
      {
      id: "scale",
      type: "number",
        label: "Scale of the message",
        default: 1.3,
        min: 1,
        max: 5,
      },
      {
      id: "hold",
      type: "number",
        label: "How much the message lasts",
        default: 1.4,
        min: 1,
        max: 5,
      },
      {
        id: "silent",
        type: "select",
        label: "is Message Silent?",
        options: [
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
        ],
        default: "true",
      },
    ],
    category: "Special",
  },
  ...SCORING_EFFECTS,
  ...ECONOMY_EFFECTS,
  ...JOKER_EFFECTS,
  ...CONSUMABLE_EFFECTS,
  ...PLAYING_CARD_EFFECTS,
  ...BLIND_AND_ANTE_EFFECTS,
  ...SHOP_EFFECTS,
  ...GAME_RULE_EFFECTS,
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
