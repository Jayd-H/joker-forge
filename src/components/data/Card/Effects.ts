import { EffectTypeDefinition } from "../../ruleBuilder/types";
import {
  SparklesIcon,
  BanknotesIcon,
  ChartBarIcon,
  UserGroupIcon,
  CakeIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { CategoryDefinition } from "../Jokers/Triggers";
import {
  RARITIES,
  STICKERS,
  POKER_HANDS,
  CONSUMABLE_SETS,
  TAROT_CARDS,
  CUSTOM_CONSUMABLES,
  PLANET_CARDS,
  SPECTRAL_CARDS,
  EDITIONS,
  RANKS,
  SEALS,
  ENHANCEMENTS,
  SUITS,
} from "../BalatroUtils";
import { GENERIC_TRIGGERS, SCORING_TRIGGERS } from "./Triggers";

export const CARD_EFFECT_CATEGORIES: CategoryDefinition[] = [
  {
    label: "Scoring",
    icon: ChartBarIcon,
  },
  {
    label: "Economy",
    icon: BanknotesIcon,
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
    label: "Variables",
    icon: Cog6ToothIcon,
  },
  {
    label: "Special",
    icon: SparklesIcon,
  },
];

export const CARD_EFFECT_TYPES: EffectTypeDefinition[] = [
  {
    id: "add_mult",
    label: "Add Mult",
    description: "Add mult to the current scoring calculation",
    applicableTriggers: SCORING_TRIGGERS,
    params: [
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 4,
        min: 1,
      },
    ],
    category: "Scoring",
  },
  {
    id: "add_chips",
    label: "Add Chips",
    description: "Add chips to the current scoring calculation",
    applicableTriggers: SCORING_TRIGGERS,
    params: [
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 30,
        min: 1,
      },
    ],
    category: "Scoring",
  },
  {
    id: "add_x_mult",
    label: "Apply XMult",
    description: "Multiply mult by the specified amount",
    applicableTriggers: SCORING_TRIGGERS,
    params: [
      {
        id: "value",
        type: "number",
        label: "Multiplier",
        default: 1.5,
        min: 1,
      },
    ],
    category: "Scoring",
  },
  {
    id: "add_x_chips",
    label: "Apply XChips",
    description: "Multiply chips by the specified amount",
    applicableTriggers: SCORING_TRIGGERS,
    params: [
      {
        id: "value",
        type: "number",
        label: "Multiplier",
        default: 2,
        min: 1,
      },
    ],
    category: "Scoring",
  },
  {
    id: "edit_dollars",
    label: "Edit Dollars",
    description: "Modify the player's money",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "operation",
        type: "select",
        label: "Operation",
        options: [
          { value: "add", label: "Add" },
          { value: "subtract", label: "Subtract" },
          { value: "set", label: "Set To" },
        ],
        default: "add",
      },
      {
        id: "value",
        type: "number",
        label: "Dollar Amount",
        default: 1,
        min: 1,
      },
    ],
    category: "Economy",
  },{
    id: "modify_internal_variable",
    label: "Modify Internal Variable",
    description: "Change an internal variable value for this joker",
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [
      {
        id: "variable_name",
        type: "text",
        label: "Variable Name",
        default: "var1",
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
        ],
      },
      {
        id: "value",
        type: "number",
        label: "Value",
        default: 1,
      },
    ],
    category: "Variables",
  },{
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
        },
        {
          id: "change_type",
          type: "select",
          label: "Change Type",
          options: [
            { value: "random", label: "Random Suit" },
            { value: "specific", label: "Specific Suit" },
          ],
          default: "random",
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
        },
      ],
      category: "Variables",
    },{
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
      },
      {
        id: "change_type",
        type: "select",
        label: "Change Type",
        options: [
          { value: "random", label: "Random Rank" },
          { value: "specific", label: "Specific Rank" },
        ],
        default: "random",
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
        options: [],
      },
      {
        id: "change_type",
        type: "select",
        label: "Change Type",
        options: [
          { value: "random", label: "Random Poker Hand" },
          { value: "specific", label: "Specific Poker Hand" },
          { value: "most_played", label: "Most Played Hand" },
          { value: "least_played", label: "Least Played Hand" },
        ],
        default: "random",
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
      },
    ],
    category: "Variables",
  },{
    id: "destroy_card",
    label: "Destroy Card",
    description: "Destroy this card",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "setGlassTrigger",
        type: "select",
        label: "Should Jokers like Glass Joker Trigger?",
        options: [
          { value: "true", label: "Yes" },
          { value: "false", label: "No" },
        ],
        default: "false",
      },
    ],
    category: "Special",
  },
  {
    id: "retrigger_card",
    label: "Retrigger Card",
    description: "Trigger this card's effect additional times",
    applicableTriggers: SCORING_TRIGGERS,
    params: [
      {
        id: "value",
        type: "number",
        label: "Number of Retriggers",
        default: 1,
        min: 1,
      },
    ],
    category: "Scoring",
  },
  {
    id: "create_joker",
    label: "Create Joker",
    description:
      "Create a random or specific joker card. For creating jokers from your own mod, it is [modprefix]_[joker_name]. You can find your mod prefix in the mod metadata page.",
    applicableTriggers: GENERIC_TRIGGERS,
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
        options: [{ value: "none", label: "No Edition" }, ...EDITIONS()],
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
    description: "Destroy an existing joker",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "selection_method",
        type: "select",
        label: "Selection Method",
        options: [
          { value: "random", label: "Random Joker" },
          { value: "specific", label: "Specific Joker" },
          { value: "position", label: "By Position" },
        ],
        default: "random",
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
        ],
        default: "first",
        showWhen: {
          parameter: "selection_method",
          values: ["position"],
        },
      },
    ],
    category: "Jokers",
  },
  {
    id: "copy_joker",
    label: "Copy Joker",
    description: "Copy an existing joker",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "selection_method",
        type: "select",
        label: "Selection Method",
        options: [
          { value: "random", label: "Random Joker" },
          { value: "specific", label: "Specific Joker" },
          { value: "position", label: "By Position" },
        ],
        default: "random",
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
        ],
        default: "first",
        showWhen: {
          parameter: "selection_method",
          values: ["position"],
        },
      },
      {
        id: "edition",
        type: "select",
        label: "Edition for Copy",
        options: [
          { value: "none", label: "No Edition" },
          { value: "e_foil", label: "Foil" },
          { value: "e_holo", label: "Holographic" },
          { value: "e_polychrome", label: "Polychrome" },
          { value: "e_negative", label: "Negative" },
        ],
        default: "none",
      },
    ],
    category: "Jokers",
  },
  {
    id: "level_up_hand",
    label: "Level Up Hand",
    description: "Increase the level of a poker hand",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "hand_selection",
        type: "select",
        label: "Hand Selection",
        options: [
          { value: "current", label: "Current Hand (Scored)" },
          { value: "specific", label: "Specific Hand" },
          { value: "most", label: "Most Played" },
          { value: "least", label: "Least Played" },
          { value: "random", label: "Random Hand" },
        ],
        default: "current",
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
    category: "Special",
  },
  {
    id: "create_consumable",
    label: "Create Consumable",
    description:
      "Create consumable cards and add them to your consumables area",
    applicableTriggers: GENERIC_TRIGGERS,
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
    id: "copy_consumable",
    label: "Copy Consumable",
    description: "Copy an existing consumable card from your collection",
    applicableTriggers: GENERIC_TRIGGERS,
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
    applicableTriggers: GENERIC_TRIGGERS,
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
    id: "create_last_played_planet",
    label: "Create Last Played Planet",
    description:
      "Create a Planet card corresponding to the last hand played (Blue Seal effect)",
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
    id: "edit_playing_card",
    label: "Edit Playing Card",
    description: "Modify the properties of this playing card",
    applicableTriggers: GENERIC_TRIGGERS,
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
      },
      {
        id: "new_enhancement",
        type: "select",
        label: "New Enhancement",
        options: () => [
          { value: "none", label: "Don't Change" },
          { value: "remove", label: "Remove Enhancement" },
          { value: "random", label: "Random" },
          ...ENHANCEMENTS(),
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
          ...SEALS(),
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
          ...EDITIONS(),
        ],
        default: "none",
      },
    ],
    category: "Special",
  },
  {
    id: "show_message",
    label: "Show Message",
    description: "Display a custom message with specified color",
    applicableTriggers: GENERIC_TRIGGERS,
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
    id: "balance",
    label: "Balance Chips and Mult",
    description: "Balance chips and mult values (Plasma Deck effect)",
    applicableTriggers: SCORING_TRIGGERS,
    params: [],
    category: "Special",
  },
  {
    id: "swap_chips_mult",
    label: "Swap Chips & Mult",
    description: "Swap the Chips and Mult values",
    applicableTriggers: SCORING_TRIGGERS,
    params: [],
    category: "Special",
  },
  {
    id: "draw_cards",
    label: "Draw Cards to Hand",
    description: "Draw cards from your deck to your hand",
    applicableTriggers: [
      "card_scored",
      "card_discarded",
      "card_held",
      "card_held_in_hand_end_of_round",
    ],
    params: [
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 1,
        min: 1,
      },
    ],
    category: "Special",
  },
  {
    id: "emit_flag",
    label: "Emit Flag",
    description:
      "Emit a custom flag. Flags are global variables that can be set to true or false and checked by any other jokers",
    applicableTriggers: [
      "card_scored",
      "card_discarded",
      "card_held",
      "card_held_in_hand_end_of_round",
    ],
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
    applicableTriggers: [...GENERIC_TRIGGERS],
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
];

export function getCardEffectsForTrigger(
  triggerId: string
): EffectTypeDefinition[] {
  return CARD_EFFECT_TYPES.filter((effect) =>
    effect.applicableTriggers?.includes(triggerId)
  );
}

export function getCardEffectTypeById(
  id: string
): EffectTypeDefinition | undefined {
  return CARD_EFFECT_TYPES.find((effect) => effect.id === id);
}
