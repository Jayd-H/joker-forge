import { CategoryDefinition } from "./Triggers";
import { GlobalConditionTypeDefinition } from "../ruleBuilder/types";
import { BOSS_BLINDS, CARD_SCOPES, COMPARISON_OPERATORS, CONSUMABLE_SETS, CUSTOM_CONSUMABLES, DECKS, EDITIONS, ENHANCEMENTS, PLANET_CARDS, POKER_HANDS, RANK_GROUPS, RANKS, RARITIES, SEALS, SPECTRAL_CARDS, STICKERS, SUIT_GROUPS, SUITS, TAGS, TAROT_CARDS, VOUCHERS } from "./BalatroUtils";
import { PROBABILITY_IDENTIFIERS } from "./Jokers/Conditions";
import { VOUCHER_GENERIC_TRIGGERS } from "./Vouchers/Conditions";
import { ArchiveBoxIcon, HandRaisedIcon, ReceiptPercentIcon, InformationCircleIcon, RectangleStackIcon, SparklesIcon, UserIcon } from "@heroicons/react/24/outline";

const GENERIC_TRIGGERS: string[] = [
  "blind_selected",
  "card_scored",
  "hand_played",
  "blind_skipped",
  "boss_defeated",
  "booster_opened",
  "booster_skipped",
  "consumable_used",
  "hand_drawn",
  "first_hand_drawn",
  "shop_entered",
  "shop_exited",
  "card_discarded",
  "hand_discarded",
  "round_end",
  "shop_reroll",
  "card_held_in_hand",
  "card_held_in_hand_end_of_round",
  "after_hand_played",
  "before_hand_played",
  "joker_evaluated",
  "card_sold",
  "card_bought",
  "selling_self",
  "buying_self",
  "card_destroyed",
  "playing_card_added",
  "game_over",
  "probability_result",
  "tag_added",
  "ante_start",
];

export const ALL_OBJECTS = [
  "joker", "consumable", "card", "voucher", "deck"
]

export const CONDITION_CATEGORIES: CategoryDefinition[] = [
  {
    label: "Hand",
    icon: HandRaisedIcon,
  },
  {
    label: "Card",
    icon: RectangleStackIcon,
  },
  {
    label: "Joker",
    icon: RectangleStackIcon,
  },
  {
    label: "Player Resources",
    icon: UserIcon,
  },
  {
    label: "Deck & Jokers",
    icon: ArchiveBoxIcon,
  },
  {
    label: "Probability",
    icon: ReceiptPercentIcon,
  },
  {
    label: "Game State",
    icon: InformationCircleIcon,
  },
  {
    label: "Special",
    icon: SparklesIcon,
  },
];

export const CONDITIONS: GlobalConditionTypeDefinition[] = [
  {
    id: "hand_type",
    label: "Hand Type",
    description: "Check the type of poker hand",
    objectUsers: ["joker"],
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "after_hand_played",
      "before_hand_played",
    ],
    params: [
      {
        id: "card_scope",
        type: "select",
        label: "Card Scope",
        options: [...CARD_SCOPES],
        default: "scoring",
      },
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: [
          { value: "contains", label: "contains" },
          { value: "equals", label: "equals" },
        ],
        default: "contains",
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
        variableTypes: ["pokerhand"]
      },
    ],
    category: "Hand",
  },
  {
    id: "card_count",
    label: "Card Count",
    description: "Check the number of cards in the played hand",
    objectUsers: ["joker"],
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "after_hand_played",
      "before_hand_played",
    ],
    params: [
      {
        id: "card_scope",
        type: "select",
        label: "Card Scope",
        options: [
          ...CARD_SCOPES,
          { value: "unscored", label: "Unscored Cards" },
        ],
        default: "scoring",
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
        default: 5,
      },
    ],
    category: "Hand",
  },
{
    id: "suit_count",
    label: "Suit Count",
    description: "Check how many cards of a specific suit are in the hand",
    objectUsers: ["joker"],
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "after_hand_played",
      "before_hand_played",
    ],
    params: [
      {
        id: "card_scope",
        type: "select",
        label: "Card Scope",
        options: [...CARD_SCOPES],
        default: "scoring",
      },
      {
        id: "suit_type",
        type: "select",
        label: "Suit Type",
        options: [
          { value: "specific", label: "Specific Suit" },
          { value: "group", label: "Suit Group" },
        ],
        variableTypes: ["suit"]
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
      {
        id: "quantifier",
        type: "select",
        label: "Condition",
        options: [
          { value: "all", label: "All cards must be this suit" },
          { value: "none", label: "No cards can be this suit" },
          { value: "exactly", label: "Exactly N cards of this suit" },
          { value: "at_least", label: "At least N cards of this suit" },
          { value: "at_most", label: "At most N cards of this suit" },
        ],
      },
      {
        id: "count",
        type: "number",
        label: "Count",
        default: 1,
        min: 1,
        showWhen: {
          parameter: "quantifier",
          values: ["exactly", "at_least", "at_most"],
        },
      },
    ],
    category: "Hand",
  },
{
    id: "rank_count",
    label: "Rank Count",
    description: "Check how many cards of a specific rank are in the hand",
    objectUsers: ["joker"],
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "after_hand_played",
      "before_hand_played",
    ],
    params: [
      {
        id: "card_scope",
        type: "select",
        label: "Card Scope",
        options: [...CARD_SCOPES],
        default: "scoring",
      },
      {
        id: "rank_type",
        type: "select",
        label: "Rank Type",
        options: [
          { value: "specific", label: "Specific Rank" },
          { value: "group", label: "Rank Group" },
        ],
        variableTypes: ["rank"]
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
      {
        id: "quantifier",
        type: "select",
        label: "Condition",
        options: [
          { value: "all", label: "All cards must be this rank" },
          { value: "none", label: "No cards can be this rank" },
          { value: "exactly", label: "Exactly N cards of this rank" },
          { value: "at_least", label: "At least N cards of this rank" },
          { value: "at_most", label: "At most N cards of this rank" },
        ],
      },
      {
        id: "count",
        type: "number",
        label: "Count",
        default: 1,
        min: 1,
        showWhen: {
          parameter: "quantifier",
          values: ["exactly", "at_least", "at_most"],
        },
      },
    ],
    category: "Hand",
  },
  {
    id: "discarded_card_count",
    label: "Discarded Card Count",
    description: "Check the number of cards in the discarded hand",
    objectUsers: ["joker"],
    applicableTriggers: ["card_discarded", "hand_discarded"],
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
        label: "Number of Cards",
        default: 5,
      },
    ],
    category: "Hand",
  },
  {
    id: "discarded_suit_count",
    label: "Discarded Suit Count",
    description:
      "Check how many cards of a specific suit are in the discarded hand",
    objectUsers: ["joker"],
    applicableTriggers: ["card_discarded", "hand_discarded"],
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
        variableTypes: ["suit"]
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
      {
        id: "quantifier",
        type: "select",
        label: "Condition",
        options: [
          { value: "all", label: "All cards must be this suit" },
          { value: "none", label: "No cards can be this suit" },
          { value: "exactly", label: "Exactly N cards of this suit" },
          { value: "at_least", label: "At least N cards of this suit" },
          { value: "at_most", label: "At most N cards of this suit" },
        ],
      },
      {
        id: "count",
        type: "number",
        label: "Count",
        default: 1,
        min: 1,
        showWhen: {
          parameter: "quantifier",
          values: ["exactly", "at_least", "at_most"],
        },
      },
    ],
    category: "Hand",
  },
  {
    id: "discarded_rank_count",
    label: "Discarded Rank Count",
    description:
      "Check how many cards of a specific rank are in the discarded hand",
    objectUsers: ["joker"],
    applicableTriggers: ["card_discarded", "hand_discarded"],
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
        variableTypes: ["rank"]
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
      {
        id: "quantifier",
        type: "select",
        label: "Condition",
        options: [
          { value: "all", label: "All cards must be this rank" },
          { value: "none", label: "No cards can be this rank" },
          { value: "exactly", label: "Exactly N cards of this rank" },
          { value: "at_least", label: "At least N cards of this rank" },
          { value: "at_most", label: "At most N cards of this rank" },
        ],
      },
      {
        id: "count",
        type: "number",
        label: "Count",
        default: 1,
        min: 1,
        showWhen: {
          parameter: "quantifier",
          values: ["exactly", "at_least", "at_most"],
        },
      },
    ],
    category: "Hand",
  },
  {
    id: "card_rank",
    label: "Card Rank",
    description: "Check the rank of the card",
    objectUsers: ["joker", "card"],
    applicableTriggers: [
      "card_scored",
      "card_discarded",
      "card_held_in_hand",
      "card_held_in_hand_end_of_round",
      "card_destroyed",
    ],
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
        variableTypes: ["rank"]
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
    objectUsers: ["joker", "card"],
    applicableTriggers: [
      "card_scored",
      "card_discarded",
      "card_held_in_hand",
      "card_held_in_hand_end_of_round",
      "card_destroyed",
    ],
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
        variableTypes: ["suit"]
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
    id: "card_enhancement",
    label: "Card Enhancement",
    description: "Check if the card has a specific enhancement",
    objectUsers: ["joker"],
    applicableTriggers: [
      "card_scored",
      "card_discarded",
      "card_held_in_hand",
      "card_held_in_hand_end_of_round",
      "card_destroyed",      
    ],
    params: [
      {
        id: "enhancement",
        type: "select",
        label: "Enhancement Type",
        options: [
          { value: "any", label: "Any Enhancement" },
          ...ENHANCEMENTS().map(e => {return {value: e.value, label: e.label}}),
        ],
      },
    ],
    category: "Card",
  },
  {
    id: "card_edition",
    label: "Card Edition",
    description: "Check if the card has a specific edition",
    objectUsers: ["joker", "card"],
    applicableTriggers: [
      "card_scored",
      "card_discarded",
      "card_held_in_hand",
      "card_held_in_hand_end_of_round",
      "card_destroyed",
    ],
    params: [
      {
        id: "edition",
        type: "select",
        label: "Edition Type",
        options: [
          { value: "any", label: "Any Edition" },
          { value: "none", label: "No Edition" },
          ...EDITIONS().map(e => {return {value: e.value, label: e.label}}),
        ],
      },
    ],
    category: "Card",
  },
  {
    id: "card_seal",
    label: "Card Seal",
    description: "Check if the card has a specific seal",
    objectUsers: ["joker", "card"],
    applicableTriggers: [
      "card_scored",
      "card_discarded",
      "card_held_in_hand",
      "card_held_in_hand_end_of_round",
      "card_destroyed",
    ],
    params: [
      {
        id: "seal",
        type: "select",
        label: "Seal Type",
        options: [
          { value: "any", label: "Any Seal" }, 
          ...SEALS().map(s => {return {value: s.value, label: s.label}}),
        ]
      },
    ],
    category: "Card",
  },
  {
    id: "card_index",
    label: "Card Index",
    description: "Check if the card is at a specific position in the hand",
    objectUsers: ["joker", "card"],
    applicableTriggers: [
      "card_scored",
      "card_held_in_hand",
      "card_held_in_hand_end_of_round",
      "card_discarded",
    ],
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
    id: "player_money",
    label: "Player Money",
    description: "Check how much money the player has",
    objectUsers: [...ALL_OBJECTS],
    applicableTriggers: [...GENERIC_TRIGGERS, "change_probability"],
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
        label: "Amount ($)",
        default: 10,
      },
    ],
    category: "Player Resources",
  },
  {
    id: "enhancement_count",
    label: "Enhancement Count",
    objectUsers: ["joker"],
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "after_hand_played",
      "before_hand_played",
    ],
    description:
      "Check how many cards with a specific enhancement are in the hand",
    params: [
      {
        id: "card_scope",
        type: "select",
        label: "Card Scope",
        options: [...CARD_SCOPES],
        default: "scoring",
      },
      {
        id: "enhancement",
        type: "select",
        label: "Enhancement Type",
        options: [
          { value: "any", label: "Any Enhancement" },
          ...ENHANCEMENTS().map(e => {return {value: e.value, label: e.label}}),
        ],
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
    category: "Hand",
  },
  {
    id: "edition_count",
    label: "Edition Count",
    description: "Check how many cards with a specific edition are in the hand",
    objectUsers: ["joker"],
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "after_hand_played",
      "before_hand_played",
    ],
    params: [
      {
        id: "card_scope",
        type: "select",
        label: "Card Scope",
        options: [...CARD_SCOPES],
        default: "scoring",
      },
      {
        id: "edition",
        type: "select",
        label: "Edition Type",
        options: [
          { value: "any", label: "Any Edition" }, 
          ...EDITIONS().map(e => {return {value: e.value, label: e.label}})
        ],
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
    category: "Hand",
  },
  {
    id: "seal_count",
    label: "Seal Count",
    description: "Check how many cards with a specific seal are in the hand",
    objectUsers: ["joker"],
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "after_hand_played",
      "before_hand_played",
    ],
    params: [
      {
        id: "card_scope",
        type: "select",
        label: "Card Scope",
        options: [...CARD_SCOPES],
        default: "scoring",
      },
      {
        id: "seal",
        type: "select",
        label: "Seal Type",
        options: [
          { value: "any", label: "Any Seal" }, 
          ...SEALS().map(s => {return {value: s.value, label: s.label}})
        ],
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
    category: "Hand",
  },
  {
    id: "poker_hand_been_played",
    label: "Poker Hand Been Played",
    objectUsers: ["joker"],
    description:
      "Check if the current poker hand has already been played this round",
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "after_hand_played",
      "before_hand_played",
    ],
    params: [],
    category: "Hand",
  },
  {
    id: "generic_compare",
    label: "Generic Compare",
    description: "Compare two custom values with an operator",
    objectUsers: ["joker", "consumable", "card", "voucher", "deck"],
    applicableTriggers: [...GENERIC_TRIGGERS, "change_probability"],
    params: [
      {
        id: "value1",
        type: "number",
        label: "First Value",
        default: 0,
      },
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: [...COMPARISON_OPERATORS],
      },
      {
        id: "value2",
        type: "number",
        label: "Second Value",
        default: 0,
      },
    ],
    category: "Special",
  },
  {
    id: "remaining_hands",
    label: "Remaining Hands",
    description: "Check how many hands the player has left",
    objectUsers: [...ALL_OBJECTS],
    applicableTriggers: [...GENERIC_TRIGGERS, "change_probability"],
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
    category: "Player Resources",
  },
  {
    id: "remaining_discards",
    label: "Remaining Discards",
    description: "Check how many discards the player has left",
    objectUsers: [...ALL_OBJECTS],
    applicableTriggers: [...GENERIC_TRIGGERS, "change_probability"],
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
    category: "Player Resources",
  },
  {
    id: "glass_card_destroyed",
    label: "Glass Card Destroyed",
    description: "Check if any glass cards were destroyed/shattered",
    objectUsers: ["joker"],
    applicableTriggers: ["card_destroyed"],
    params: [],
    category: "Hand",
  },
  {
    id: "lucky_card_triggered",
    label: "Lucky Card Triggered",
    description: "Check if a lucky card's special effect was triggered when scored",
    objectUsers: ["joker"],
    applicableTriggers: ["card_scored"],
    params: [],
    category: "Card",
  },
  {
    id: "joker_count",
    label: "Joker Count",
    description: "Check how many jokers the player has",
    objectUsers: [...ALL_OBJECTS],
    applicableTriggers: [...GENERIC_TRIGGERS, "change_probability"],
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
        options: [
          { value: "any", label: "Any Rarity" }, 
          ...RARITIES().map(r => {return {value: r.value, label: r.label}})
        ],
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
    id: "first_last_scored",
    label: "First/Last Scored",
    description:
      "Check if this is the first or last card of a specific type to be scored",
    objectUsers: ["joker"],
    applicableTriggers: ["card_scored"],
    params: [
      {
        id: "position",
        type: "select",
        label: "Position",
        options: [
          { value: "first", label: "First" },
          { value: "last", label: "Last" },
        ],
        default: "first",
      },
      {
        id: "check_type",
        type: "select",
        label: "Check Type",
        options: [
          { value: "any", label: "Any Card" },
          { value: "rank", label: "Specific Rank" },
          { value: "suit", label: "Specific Suit" },
        ],
        default: "any",
      },
      {
        id: "specific_rank",
        type: "select",
        label: "Rank",
        options: [...RANKS, ...RANK_GROUPS],
        showWhen: {
          parameter: "check_type",
          values: ["rank"],
        },
        variableTypes: ["rank"]
      },
      {
        id: "specific_suit",
        type: "select",
        label: "Suit",
        options: [...SUITS],
        showWhen: {
          parameter: "check_type",
          values: ["suit"],
        },
        variableTypes: ["suit"]
      },
    ],
    category: "Card",
  },
  {
    id: "specific_joker",
    label: "Specific Joker",
    description: "Check if a specific joker is in your collection",
    objectUsers: [...ALL_OBJECTS],
    applicableTriggers: [...GENERIC_TRIGGERS, "change_probability"],
    params: [
      {
        id: "type",
        type: "select",
        label: "Joker",
        options: [
          { value: "key", label: "Joker Key" },
          { value: "variable", label: "Joker Variable" },
        ],
        default: "key",
      },
      {
        id: "joker_key",
        type: "text",
        label: "Joker Key (e.g., joker, greedy_joker)",
        default: "joker",
        showWhen: {
          parameter: "type",
          values: ["key"]
        }
      },
      {
        id: "joker_variable",
        type: "select",
        label: "Joker Variable",
        showWhen: {
          parameter: "type",
          values: ["variable"]
        }
      },
    ],
    category: "Deck & Jokers",
  },
  {
    id: "internal_variable",
    label: "Internal Variable",
    description: "Check the value of an internal variable for this joker",
    objectUsers: ["joker", "card"],
    applicableTriggers: [...GENERIC_TRIGGERS, "change_probability"],
    params: [
      {
        id: "variable_name",
        type: "select",
        label: "Variable Name",
        default: "var1",
        variableTypes: ["number"]
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
  {
    id: "check_flag",
    label: "Check Flag",
    description: "Check if a specific flag from your mod is true",
    objectUsers: [...ALL_OBJECTS],
    applicableTriggers: [...GENERIC_TRIGGERS,],
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
  {
    id: "which_tag",
    label: "Check Which Tag Got Added",
    description: "Check Which Tag Got Added",
    objectUsers: ["joker"],
    applicableTriggers: ["tag_added"],
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: [
          { value: "equals", label: "Equals" },
          { value: "not_equals", label: "Not Equals" },
        ],
        default: "equals",
      },
      {
        id: "value",
        type: "select",
        label: "Tag Key",
        options: [...TAGS],
        default: "double",
      },
    ],
    category: "Special",
  },
  {
    id: "consumable_count",
    label: "Consumable Count",
    description: "Check how many of a consumable a player has",
    objectUsers: ["joker", "consumable", "voucher", "deck"],
    applicableTriggers: [...GENERIC_TRIGGERS, "change_probability",],
    params: [
      {
        id: "consumable_type",
        type: "select",
        label: "Consumable Type",
        options: [
          { value: "any", label: "Any Consumable" },
          ...CONSUMABLE_SETS().map(cs => {return {value: cs.value, label: cs.label}}),
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
    category: "Player Resources",
  }, 
  {
    id: "consumable_type",
    label: "Consumable Type",
    description: "Check the type of consumable being bought or used",
    objectUsers: ["joker"],
    applicableTriggers: ["card_bought", "consumable_used"],
    params: [
      {
        id: "consumable_type",
        type: "select",
        label: "Consumable Type",
        options: [
          { value: "any", label: "Any Consumable" },
          ...CONSUMABLE_SETS().map(cs => {return {value: cs.value, label: cs.label}}),
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
    ],
    category: "Player Resources",
  },
  {
    id: "hand_level",
    label: "Hand Level",
    description: "Check the level of a poker hand",
    objectUsers: ["joker", "card"],
    applicableTriggers: [...GENERIC_TRIGGERS, "change_probability"],
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
    category: "Game State",
  },
  {
    id: "blind_type",
    label: "Blind Type",
    description: "Check the type of the current blind",
    objectUsers: [...ALL_OBJECTS],
    applicableTriggers: [...GENERIC_TRIGGERS, "change_probability"],
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
    category: "Game State",
  },
  {
    id: "boss_blind_type",
    label: "Boss Blind Type",
    description: "Check the type of the current boss blind",
    objectUsers: [...ALL_OBJECTS],
    applicableTriggers: [...GENERIC_TRIGGERS, "blind_selected"],
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: [
          { value: "equals", label: "Equals" },
          { value: "not_equals", label: "Not Equals" },
        ],
        default: "equals",
      },
      {
        id: "value",
        type: "select",
        label: "Boss Blind",
        options: [...BOSS_BLINDS],
        default: "bl_hook",
      },
    ],
    category: "Game State",
  },
  {
    id: "blind_name",
    label: "Blind Name",
    description: "Check the current blind",
    objectUsers: ["joker", "consumable", "voucher", "deck"],
    applicableTriggers: [...GENERIC_TRIGGERS, "blind_selected"],
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
    category: "Game State",
  },
  {
    id: "check_blind_requirements",
    label: "Blind Requirements",
    description:
      "Check what percentage of the blind requirement the current base hand score represents (e.g., 110% means you've exceeded the blind by 10%, values over 100% check if you've exceeded the blind)",
    objectUsers: ["joker", "consumable", "voucher", "deck"],
    applicableTriggers: [
      "after_hand_played",
      "before_hand_played",
      "hand_played",
      "card_scored",
      "round_end",
      "hand_discarded",
      "card_discarded",
      "selling_self",
      "card_sold",
      "hand_drawn",
      "first_hand_drawn",
      "game_over",
      "card_destroyed",
    ],
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
    category: "Game State",
  },
  {
    id: "joker_selected",
    label: "Joker Selected",
    description: "Check if a joker is selected/highlighted",
    objectUsers: ["joker", "consumable"],
    applicableTriggers:  [...GENERIC_TRIGGERS],
    params: [
      {
        id: "check_key",
        type: "select",
        label: "Specific Joker",
        options: [
          {value: "any", label: "Any Joker"},
          {value: "key", label: "Specific Key"},
        ],
        default: "any",
        exemptObjects: ["consumable"]
      },
      {
        id: "joker_key",
        type: "text",
        label: "Joker Key ( [modprefix]_joker )",
        default: "joker",
        showWhen: {
          parameter: "check_key",
          values: ["key"]
        },
        exemptObjects: ["consumable"]
      },
      {
        id: "rarity",
        type: "select",
        label: "Rarity",
        options: [
          {value: "any", label: "Any"},
          ...RARITIES().map(r => {return {value: r.value, label: r.label}}),
        ],
        showWhen: {
          parameter: "check_key",
          values: ["any"]
        },
        default: "any",
        exemptObjects: ["consumable"]
      },
    ],
    category: "Deck & Jokers",
  },
  {
    id: "voucher_redeemed",
    label: "Voucher Redeemed",
    description: "Check if a specific Voucher was redeemed during the run",
    objectUsers: [...ALL_OBJECTS],
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [
      {
        id: "voucher",
        type: "select",
        label: "Voucher",
        options: [
          ...VOUCHERS().map(v => {return {value: v.value, label: v.label}})
        ],
        default: "v_overstock_norm",
      },
    ],
    category: "Game State",
  },
  {
    id: "triggered_boss_blind",
    label: "Boss Blind Triggered",
    description: "Check if the current boss blind's effect has been triggered",
    objectUsers: ["joker", "card"],
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [],
    category: "Game State",
  },
  {
    id: "ante_level",
    label: "Ante Level",
    description: "Check the current ante level",
    objectUsers: ["joker", "consumable", "card"],
    applicableTriggers: [...GENERIC_TRIGGERS, "change_probability"],
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
    category: "Game State",
  },
  {
    id: "first_played_hand",
    label: "First Played Hand",
    description: "Check if this is the first hand played in the current round",
    objectUsers: ["joker", "card"],
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_discarded",
      "after_hand_played",
      "before_hand_played",
    ],
    params: [],
    category: "Game State",
  },
  {
    id: "first_discarded_hand",
    label: "First Discarded Hand",
    description: "Check if this is the first hand discarded in the current round",
    objectUsers: ["joker"],
    applicableTriggers: ["card_discarded", "hand_discarded"],
    params: [],
    category: "Game State",
  },
  {
    id: "system_condition",
    label: "Player OS",
    description: "Check on what Operating System the player is on",
    objectUsers: [...ALL_OBJECTS],
    applicableTriggers: GENERIC_TRIGGERS,
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
    category: "Game State",
  },
  {
    id: "deck_check",
    label: "Deck Check",
    description: "Check on what Deck the player is on",
    objectUsers: ["joker", "consumable", "voucher", "deck"],
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "decks",
        type: "select",
        label: "Deck",
        options: [
        ...DECKS().map(d => {return {value: d.value, label: d.label}}),
        ],
        default: "Red Deck",
      },
    ],
    category: "Deck & Jokers",
  },
  {
    id: "hand_size",
    label: "Hand Size",
    description: "Check the current hand size",
    objectUsers: [...ALL_OBJECTS],
    applicableTriggers: [...GENERIC_TRIGGERS, "change_probability"],
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
    category: "Player Resources",
  },
  {
    id: "deck_size",
    label: "Deck Size",
    description: "Check the size of the deck",
    objectUsers: [...ALL_OBJECTS],
    applicableTriggers: [...GENERIC_TRIGGERS, "change_probability"],
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
    id: "deck_count",
    label: "Deck Count",
    description: "Count cards in your entire deck by property",
    objectUsers: ["joker", "consumable", "voucher", "deck"],
    applicableTriggers: [...GENERIC_TRIGGERS, "change_probability"],
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
        options: [
          { value: "any", label: "Any Rank" }, 
          ...RANKS
        ],
        showWhen: {
          parameter: "property_type",
          values: ["rank"],
        },
        variableTypes: ["rank"]
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
        variableTypes: ["suit"]
      },
      {
        id: "enhancement",
        type: "select",
        label: "Enhancement",
        options: [
          { value: "any", label: "Any Enhancement" },
          { value: "none", label: "No Enhancement" },
          ...ENHANCEMENTS().map(e => {return {value: e.value, label: e.label}}),
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
        options: [
          { value: "any", label: "Any Seal" },
          { value: "none", label: "No Seal" },
          ...SEALS().map(s => {return {value: s.value, label: s.label}}),
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
          ...EDITIONS().map(e => {return {value: e.value, label: e.label}}),
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
    id: "probability_succeeded",
    label: "Probability Succeeded",
    description: "Check if the probability succeeded or failed",
    objectUsers: ["joker"],
    applicableTriggers: ["probability_result"],
    params: [
      {
        id: "status",
        type: "select",
        label: "Status",
        options: [
          { value: "succeeded", label: "Succeeded" },
          { value: "failed", label: "Failed" },
        ],
        default: "succeeded",
      },
    ],
    category: "Probability",
  },
  {
    id: "probability_identifier",
    label: "Detect Probability",
    description: "Check what card caused the probability roll",
    objectUsers: ["joker"],
    applicableTriggers: ["change_probability", "probability_result"],
    params: [
      {
        id: "mode",
        type: "select",
        label: "Mode",
        options: [
          { value: "vanilla", label: "Vanilla" },
          { value: "custom", label: "Custom" },
        ],
        default: "vanilla",
      },
      {
        id: "property_type",
        type: "select",
        label: "Property Type",
        options: [
          { value: "jokers", label: "Jokers" },
          { value: "consumables", label: "Consumables" },
          { value: "enhancements", label: "Enhancements" },
          { value: "blinds", label: "Blinds" },
        ],
        default: "jokers",
        showWhen: {
          parameter: "mode",
          values: ["vanilla"],
        },
      },
      {
        id: "specific_card",
        type: "select",
        label: "Specific Card",
        options: (parentValues) => {
          switch (parentValues?.property_type) {
            case "jokers":
              return [...PROBABILITY_IDENTIFIERS.jokers];
            case "consumables":
              return [...PROBABILITY_IDENTIFIERS.consumables];
            case "enhancements":
              return [...PROBABILITY_IDENTIFIERS.enhancements];
            case "blinds":
              return [...PROBABILITY_IDENTIFIERS.blinds];
            default:
              return [...PROBABILITY_IDENTIFIERS.jokers];
          }
        },
        default: "8ball",
        showWhen: {
          parameter: "mode",
          values: ["vanilla"],
        },
      },
      {
        id: "card_key",
        type: "text",
        label: "Card Key (joker: j_modprefix_key, consumable: c_modprefix_key)",
        showWhen: {
          parameter: "mode",
          values: ["custom"],
        },
      },
    ],
    category: "Probability",
  },
  {
    id: "probability_part_compare",
    label: "Probability Compare",
    description: "Compare the Numerator or the Denominator with a custom value",
    objectUsers: ["joker"],
    applicableTriggers: ["change_probability", "probability_result"],
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
        id: "operator",
        type: "select",
        label: "Operator",
        options: [...COMPARISON_OPERATORS],
      },
      {
        id: "value",
        type: "number",
        label: "Second Value",
        default: 1,
      },
    ],
    category: "Probability",
  },
  {
    id: "joker_specific",
    label: "Specific Joker",
    description: "Check the key of the evaluated joker",
    objectUsers: ["joker"],
    applicableTriggers: ["joker_evaluated"],
    params: [
      {
        id: "type",
        type: "select",
        label: "Joker",
        options: [
          {value: "key", label: "Specific Key"},
          {value: "variable", label: "Joker Variable"},
        ]
      },
      {
        id: "joker_key",
        type: "text",
        label: "Joker Key ( [modprefix]_joker )",
        default: "joker",
        showWhen: {
          parameter: "type",
          values: ["key"]
        }
      },
      {
        id: "joker_variable",
        type: "select",
        label: "Joker Variable",
        variableTypes: ["joker"],
        showWhen: {
          parameter: "type",
          values: ["variable"]
        }
      },
    ],
    category: "Joker",
  },
  {
    id: "joker_rarity",
    label: "Joker Rarity",
    description: "Check the rarity of the evaluated joker",
    objectUsers: ["joker"],
    applicableTriggers: ["joker_evaluated"],
    params: [
      {
        id: "rarity",
        type: "select",
        label: "Rarity",
        options: [
          ...RARITIES().map(r => {return {value: r.value, label: r.label}})
        ],
        default: "common",
      },
    ],
    category: "Joker",
  },
  {
    id: "joker_index",
    label: "Joker Position",
    description: "Check the position of the evaluated joker",
    objectUsers: ["joker"],
    applicableTriggers: ["joker_evaluated"],
    params: [
      {
        id: "position",
        type: "select",
        label: "Position",
        options: [
          { value: "first", label: "First Joker" },
          { value: "last", label: "Last Joker" },
          { value: "specific", label: "Specific Index" },
        ],
        default: "first",
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
    category: "Joker",
  },
  {
    id: "this_joker_index",
    label: "This Joker Position",
    description: "Check the position of this joker",
    objectUsers: ["joker"],
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [
      {
        id: "position",
        type: "select",
        label: "Position",
        options: [
          { value: "first", label: "First Joker" },
          { value: "last", label: "Last Joker" },
          { value: "specific", label: "Specific Index" },
        ],
        default: "first",
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
    category: "Deck & Jokers",
  },
  {
    id: "joker_sticker",
    label: "Joker Sticker",
    description: "Check the stickers of the evaluated joker",
    objectUsers: ["joker", "consumable"],
    applicableTriggers: ["joker_evaluated", "card_used"],
    params: [
      {
        id: "sticker",
        type: "select",
        label: "Sticker",
        options: [
          ...STICKERS.map(s => {return {value: s.value, label: s.label}})
        ],
        default: "eternal",
      },
    ],
    category: "Joker",
  },
  {
    id: "this_joker_sticker",
    label: "This Joker Sticker",
    description: "Check the stickers of this joker",
    objectUsers: ["joker"],
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [
      {
        id: "sticker",
        type: "select",
        label: "Sticker",
        options: [
          ...STICKERS.map(s => {return {value: s.value, label: s.label}})
        ],
        default: "eternal",
      },
    ],
    category: "Deck & Jokers",
  },
  {
    id: "joker_flipped",
    label: "Joker is Flipped",
    description: "Check if the joker is flipped (facing back)",
    objectUsers: ["joker", "consumable"],
    applicableTriggers: ["joker_evaluated", "card_used"],
    params: [],
    category: "Joker",
  },
  {
    id: "this_joker_flipped",
    label: "This Joker is Flipped",
    description: "Check if this joker is flipped (facing back)",
    objectUsers: ["joker"],
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [],
    category: "Deck & Jokers",
  },
  {
    id: "cards_selected",
    label: "Cards Selected",
    description: "Check how many cards are selected/highlighted",
    objectUsers: ["consumable"],
    applicableTriggers: ["card_used"],
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
    id: "hand_drawn",
    label: "Hand Drawn",
    description: "Check if a hand is currently drawn",
    objectUsers: ["consumable", "voucher", "deck"],
    applicableTriggers: ["card_used", ...VOUCHER_GENERIC_TRIGGERS],
    params: [],
    category: "Game Context",
  },
  {
    id: "in_blind",
    label: "In Blind",
    description: "Check if the player is currently in a blind (gameplay)",
    objectUsers: ["consumable"],
    applicableTriggers: ["card_used"],
    params: [],
    category: "Game Context",
  },
]

export function getConditionTypeById(
  id: string
): GlobalConditionTypeDefinition | undefined {
  return CONDITIONS.find((conditionType) => conditionType.id === id);
}

export function getConditionsForTrigger(
  triggerId: string,
  itemType: string,
): GlobalConditionTypeDefinition[] {
  if (itemType === "enhancement" || itemType === "edition" || itemType === "seal") {
    itemType = "card"
  }
  return CONDITIONS.filter(
    (condition) =>
      condition.applicableTriggers &&
      condition.applicableTriggers.includes(triggerId) && 
      condition.objectUsers.includes(itemType)
  );
}
