import { GlobalEffectTypeDefinition } from "../../ruleBuilder/types";
import { CONSUMABLE_SETS, POKER_HANDS, RANKS, RARITIES, SUITS } from "./../BalatroUtils";
import { GENERIC_TRIGGERS } from "./../Conditions";

  
export const VARIABLE_EFFECTS: GlobalEffectTypeDefinition[] = [
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
        variableTypes: ["key"]
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
        variableTypes: ["suit_context"]
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
        default: SUITS.map(() => false)
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
        variableTypes: ["suit"]
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
    objectUsers: ["joker", "card"],
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
        variableTypes: ["rank_context"]
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
        default: RANKS.map(() => false)
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
        variableTypes: ["rank"]
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
        default: POKER_HANDS.map(() => false)
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
    id: "change_text_variable",
    label: "Change Text Variable",
    description: "Change the value of a text variable",
    applicableTriggers: [...GENERIC_TRIGGERS],
    objectUsers: ["joker"],
    params: [
      {
        id: "variable_name",
        type: "select",
        label: "Text Variable",
        options: [], // Will be populated dynamically with rank variables
        variableTypes: ["text"]
      },
      {
        id: "change_type",
        type: "select",
        label: "Change Type",
        options: [
          { value: "custom_text", label: "Custom Text" },
          { value: "key_var", label: "Name of a Key Variable" },
        ],
        default: "random",
      },
      {
        id: "text",
        type: "text",
        label: "Custom Text",
        default: "Hello",
        showWhen: {
          parameter: "change_type",
          values: ["custom_text"],
        },
      },
      {
        id: "key_variable",
        type: "select",
        label: "Key Variable",
        options: [],
        showWhen: {
          parameter: "change_type",
          values: ["key_var"],
        },
        variableTypes: ["key"]
      },
    ],
    category: "Variables",
  },
  {
    id: "change_key_variable",
    label: "Change Key Variable",
    description:
      "Change the value of a key variable to a specific object key",
    applicableTriggers: [...GENERIC_TRIGGERS],
    objectUsers: ["joker"],
    params: [
      {
        id: "variable_name",
        type: "select",
        label: "Key Variable",
        options: [], // Will be populated dynamically with key variables
        variableTypes: ["key"]
      },
      {
        id: "key_type",
        type: "select",
        label: "Change Type",
        options: [
          { value: "joker", label: "Joker" }, 
          { value: "consumable", label: "Consumable" },
          { value: "enhancement", label: "Enhancement" },
          { value: "seal", label: "Seal" },
          { value: "edition", label: "Edition" },
          { value: "booster", label: "Booster" },
          { value: "voucher", label: "Voucher" },
          { value: "tag", label: "Tag" },
        ],
        default: "joker",
      },
      // JOKERS
      {
        id: "joker_change_type",
        type: "select",
        label: "Change Type (Joker)",
        options: [
          { value: "random", label: "Random Joker" }, 
          { value: "specific", label: "Specific Joker Key" },
          { value: "increment", label: "Increment In Collection Order" },
        ],
        default: "specific",
        variableTypes: ["key", "joker_context"],
        showWhen: {
          parameter: "key_type",
          values: ["joker"],
        }, 
      },
      {
        id: "joker_random_type",
        type: "select",
        label: "Random Joker from Type",
        options: [
          { value: "all", label: "Random From All Jokers" },
          { value: "unlocked", label: "Random from Unlocked Jokers" },
          { value: "locked", label: "Random from Locked Jokers" },
          { value: "pool", label: "Random from Pool" },
          { value: "owned", label: "Random from Owned Jokers" },
          { value: "rarity", label: "Random from a Specific Rarity" },
        ],
        default: "all",
        showWhen: {
          parameter: "joker_change_type",
          values: ["random"],
        },
      },
      {
        id: "joker_rarity",
        type: "select",
        label: "Rarity",
        options: [...RARITIES()],
        showWhen: {
          parameter: "joker_random_type",
          values: ["rarity"],
        },
      },
      {
        id: "joker_pool",
        type: "text",
        label: "Pool",
        showWhen: {
          parameter: "joker_random_type",
          values: ["pool"],
        },
      },
      {
        id: "specific_joker",
        type: "text",
        label: "Joker Key",
        showWhen: {
          parameter: "joker_change_type",
          values: ["specific"],
        },
      },
      {
        id: "joker_increment_count",
        type: "number",
        label: "Increment Count",
        default: 1,
        showWhen: {
          parameter: "joker_change_type",
          values: ["increment"],
        },
      },
      // CONSUMABLES
      {
        id: "consumable_change_type",
        type: "select",
        label: "Change Type (Consumable)",
        options: [
          { value: "random", label: "Random Consumable" }, 
          { value: "specific", label: "Specific Consumable Key" },
          { value: "increment", label: "Increment In Collection Order" },
        ],
        default: "specific",
        variableTypes: ["key", "consumable_context"],
        showWhen: {
          parameter: "key_type",
          values: ["consumable"],
        },    
      },
      {
        id: "consumable_random_type",
        type: "select",
        label: "Random Consumable from Type",
        options: [
          { value: "all", label: "Random From All Consumables" },
          { value: "set", label: "Random from a Consumable Set" },
          { value: "owned", label: "Random from Owned Consumables" },
        ],
        default: "all",
        showWhen: {
          parameter: "consumable_change_type",
          values: ["random"],
        },
      },
      {
        id: "consumable_set",
        type: "select",
        label: "Consumable Set",
        options: [
          ...CONSUMABLE_SETS(),
        ],
        default: "all",
        showWhen: {
          parameter: "consumable_random_type",
          values: ["set"],
        },
      },
      {
        id: "specific_consumable",
        type: "text",
        label: "Consumable Key",
        showWhen: {
          parameter: "consumable_change_type",
          values: ["specific"],
        },
      },
      {
        id: "consumable_increment_count",
        type: "number",
        label: "Increment Count",
        default: 1,
        showWhen: {
          parameter: "consumable_change_type",
          values: ["increment"],
        },
      },
      // ENHANCEMENTS
      {
        id: "enhancement_change_type",
        type: "select",
        label: "Change Type (Enhancement)",
        options: [
          { value: "random", label: "Random Enhancement" }, 
          { value: "specific", label: "Specific Enhancement Key" },
          { value: "increment", label: "Increment In Collection Order" },
        ],
        default: "specific",
        variableTypes: ["key", "enhancement_context"],
        showWhen: {
          parameter: "key_type",
          values: ["enhancement"],
        },    
      },
      {
        id: "enhancement_random_type",
        type: "select",
        label: "Random Enhancement from Type",
        options: [
          { value: "all", label: "Random From All Enhancements" },
        ],
        default: "all",
        showWhen: {
          parameter: "enhancement_change_type",
          values: ["random"],
        },
      },
      {
        id: "specific_enhancement",
        type: "text",
        label: "Enhancement Key",
        showWhen: {
          parameter: "enhancement_change_type",
          values: ["specific"],
        },
      },
      {
        id: "enhancement_increment_count",
        type: "number",
        label: "Increment Count",
        default: 1,
        showWhen: {
          parameter: "enhancement_change_type",
          values: ["increment"],
        },
      },
      // SEALS
      {
        id: "seal_change_type",
        type: "select",
        label: "Change Type (Seals)",
        options: [
          { value: "random", label: "Random Seal" }, 
          { value: "specific", label: "Specific Seal Key" },
          { value: "increment", label: "Increment In Collection Order" },
        ],
        default: "specific",
        variableTypes: ["key", "seal_context"],
        showWhen: {
          parameter: "key_type",
          values: ["seal"],
        },    
      },
      {
        id: "seal_random_type",
        type: "select",
        label: "Random Seal from Type",
        options: [
          { value: "all", label: "Random From All Seals" },
        ],
        default: "all",
        showWhen: {
          parameter: "seal_change_type",
          values: ["random"],
        },
      },
      {
        id: "specific_seal",
        type: "text",
        label: "Seal Key",
        showWhen: {
          parameter: "seal_change_type",
          values: ["specific"],
        },
      },
      {
        id: "seal_increment_count",
        type: "number",
        label: "Increment Count",
        default: 1,
        showWhen: {
          parameter: "seal_change_type",
          values: ["increment"],
        },
      },
      // EDITIONS
      {
        id: "edition_change_type",
        type: "select",
        label: "Change Type (Editions)",
        options: [
          { value: "random", label: "Random Edition" }, 
          { value: "specific", label: "Specific Edition Key" },
          { value: "increment", label: "Increment In Collection Order" },
        ],
        default: "specific",
        variableTypes: ["key", "edition_context"],
        showWhen: {
          parameter: "key_type",
          values: ["edition"],
        },    
      },
      {
        id: "edition_random_type",
        type: "select",
        label: "Random Edition from Type",
        options: [
          { value: "all", label: "Random From All Editions" },
        ],
        default: "all",
        showWhen: {
          parameter: "edition_change_type",
          values: ["random"],
        },
      },
      {
        id: "specific_edition",
        type: "text",
        label: "Edition Key",
        showWhen: {
          parameter: "edition_change_type",
          values: ["specific"],
        },
      },
      {
        id: "edition_increment_count",
        type: "number",
        label: "Increment Count",
        default: 1,
        showWhen: {
          parameter: "edition_change_type",
          values: ["increment"],
        },
      },
      // VOUCHERS
      {
        id: "voucher_change_type",
        type: "select",
        label: "Change Type (Voucher)",
        options: [
          { value: "random", label: "Random Vouchers" }, 
          { value: "specific", label: "Specific Voucher Key" },
          { value: "increment", label: "Increment In Collection Order" },
        ],
        default: "specific",
        variableTypes: ["key", "voucher_context"],
        showWhen: {
          parameter: "key_type",
          values: ["voucher"],
        },    
      },
      {
        id: "voucher_random_type",
        type: "select",
        label: "Random Voucher from Type",
        options: [
          { value: "all", label: "Random From All Vouchers" },
          { value: "possible", label: "Random from Available Vouchers" },
        ],
        default: "all",
        showWhen: {
          parameter: "voucher_change_type",
          values: ["random"],
        },
      },
      {
        id: "specific_voucher",
        type: "text",
        label: "Voucher Key",
        showWhen: {
          parameter: "voucher_change_type",
          values: ["specific"],
        },
      },
      {
        id: "voucher_increment_count",
        type: "number",
        label: "Increment Count",
        default: 1,
        showWhen: {
          parameter: "voucher_change_type",
          values: ["increment"],
        },
      },
      // BOOSTERS
      {
        id: "booster_change_type",
        type: "select",
        label: "Change Type (Booster)",
        options: [
          { value: "random", label: "Random Booster" }, 
          { value: "specific", label: "Specific Booster Key" },
          { value: "increment", label: "Increment In Collection Order" },
        ],
        default: "specific",
        variableTypes: ["key", "booster_context"],
        showWhen: {
          parameter: "key_type",
          values: ["booster"],
        },    
      },
      {
        id: "booster_random_type",
        type: "select",
        label: "Random Booster from Type",
        options: [
          { value: "all", label: "Random From All Boosters" },
          { value: "category", label: "Random from a Booster Category" },
          { value: "size", label: "Random from a Booster Size Category" },
        ],
        default: "all",
        showWhen: {
          parameter: "booster_change_type",
          values: ["random"],
        },
      },
      {
        id: "booster_category",
        type: "select",
        label: "Booster Category",
        options: [
          { value: "Arcana", label: "Arcana Pack" },
          { value: "Celestial", label: "Celestial Pack" },
          { value: "Spectral", label: "Spectral Pack" },
          { value: "Standard", label: "Standard Pack" },
          { value: "Buffoon", label: "Buffoon Pack" },
        ],
        default: 'Arcana',
        showWhen: {
          parameter: "booster_random_type",
          values: ["category"],
        },
      },
      {
        id: "booster_size_extra",
        type: "number",
        label: "Number of Choices",
        showWhen: {
          parameter: "booster_random_type",
          values: ["size"],
        },
      },
      {
        id: "booster_size_choose",
        type: "number",
        label: "Number of Cards to Select",
        showWhen: {
          parameter: "booster_random_type",
          values: ["size"],
        },
      },
      {
        id: "specific_booster",
        type: "text",
        label: "booster Key",
        showWhen: {
          parameter: "booster_change_type",
          values: ["specific"],
        },
      },
      {
        id: "booster_increment_count",
        type: "number",
        label: "Increment Count",
        default: 1,
        showWhen: {
          parameter: "booster_change_type",
          values: ["increment"],
        },
      },
      // TAG
      {
        id: "tag_change_type",
        type: "select",
        label: "Change Type (Tag)",
        options: [
          { value: "random", label: "Random Tag" }, 
          { value: "specific", label: "Specific Tag Key" },
          { value: "increment", label: "Increment In Collection Order" },
        ],
        default: "specific",
        variableTypes: ["key", "tag_context"],
        showWhen: {
          parameter: "key_type",
          values: ["tag"],
        },    
      },
      {
        id: "tag_random_type",
        type: "select",
        label: "Random Tag from Type",
        options: [
          { value: "all", label: "Random From All Tags" },
        ],
        default: "all",
        showWhen: {
          parameter: "tag_change_type",
          values: ["random"],
        },
      },
      {
        id: "specific_tag",
        type: "text",
        label: "Tag Key",
        showWhen: {
          parameter: "tag_change_type",
          values: ["specific"],
        },
      },
      {
        id: "tag_increment_count",
        type: "number",
        label: "Increment Count",
        default: 1,
        showWhen: {
          parameter: "tag_change_type",
          values: ["increment"],
        },
      },
    ],
    category: "Variables",
  }
]