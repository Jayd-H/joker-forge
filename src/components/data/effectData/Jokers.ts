import { GlobalEffectTypeDefinition } from "../../ruleBuilder/types";
import { EDITIONS, RARITIES, STICKERS } from "../BalatroUtils";
import { ALL_OBJECTS, GENERIC_TRIGGERS } from "../Conditions";
  
export const JOKER_EFFECTS: GlobalEffectTypeDefinition[] = [
  {
    id: "create_joker",
    label: "Create Joker",
    description:
      "Create a random or specific joker card. For creating jokers from your own mod, it is [modprefix]_[joker_name]. You can find your mod prefix in the mod metadata page.",
    applicableTriggers: [...GENERIC_TRIGGERS, "card_used"],
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
        variableTypes: ["key", "joker_context"]
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
          ...EDITIONS()
        ],
        default: "none",
        variableTypes: ["key"],
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
    applicableTriggers: [...GENERIC_TRIGGERS, "card_used"],
    objectUsers: ["joker", "consumable", "card"],
    params: [
      {
        id: "selection_method",
        type: "select",
        label: "Selection Method",
        options: [
          { value: "random", label: "Random Joker" },
          { value: "position", label: "By Position" },
        ],
        default: "random",
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
          ...EDITIONS()
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
    id: "edit_joker",
    label: "Edit Joker",
    description: "Edit a joker in your joker area",
    objectUsers: ["consumable"],
    applicableTriggers: ["card_used", "held_hand"],
    params: [
      {
        id: "target",
        type: "select",
        label: "Selection Method",
        options: [
          {value: "random", label: "Random"},
        ],
        default: "random",
        variableTypes: ["joker_context"]
      },
      {
        id: "edition",
        type: "select",
        label: "Edition to Apply",
        options: [
          { value: "none", label: "No Change" },
          { value: "random", label: "Random Edition" },
          { value: "remove", label: "Remove Edition" },
          ...EDITIONS(),
        ],
        default: "none",
      },
      {
        id: "sticker",
        type: "select",
        label: "Sticker",
        options: [
        { value: "none", label: "No Change" },
        { value: "remove", label: "Remove Sticker" },
        ...STICKERS,
        ],
        default: "none",
      },
    ],
    category: "Jokers",
  },
  {
    id: "copy_joker_ability",
    label: "Copy Joker Ability",
    description: "Copy the calculate function of another joker (like Blueprint/Brainstorm)",
    objectUsers: ["joker"],
    applicableTriggers: ["passive"],
    params: [
      {
        id: "selection_method",
        type: "select",
        label: "Target Joker",
        options: [
          { value: "right", label: "Joker to the Right" },
          { value: "left", label: "Joker to the Left" },
          { value: "first", label: "Left Most Joker" },
          { value: "last", label: "Right Most Joker" },
          { value: "specific", label: "Specific Position" },
        ],
        default: "right",
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
    id: "destroy_joker",
    label: "Destroy Joker",
    description:
      "Destroy an existing joker from your collection. For destroying jokers from your own mod, it is j_[modprefix]_[joker_name]. You can find your mod prefix in the mod metadata page.",
    applicableTriggers: [...GENERIC_TRIGGERS, "card_used"],
    objectUsers: ["joker", "consumable", "card"],
    params: [
      {
        id: "selection_method",
        type: "select",
        label: "Selection Method",
        options: [
          { value: "random", label: "Random Joker" },
          { value: "specific", label: "Specific Joker" },
          { value: "self", label: "This Joker", exempt: ["consumable", "card"] },
          { value: "position", label: "By Position" },
        ],
        default: "random",
        variableTypes: ["key", "joker_context"],
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
          { value: "left", label: "Left of This Joker", exempt: ["consumable", "card"] },
          { value: "right", label: "Right of This Joker", exempt: ["consumable", "card"] },
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
        exemptObjects: ["consumable", "card"],
        default: "no",
      },
      {
        id: "sell_value_multiplier",
        type: "number",
        label: "Sell Value Multiplier (0 = disabled)",
        default: 0,
        exemptObjects: ["consumable", "card"]
      },
      {
        id: "variable_name",
        type: "select",
        label: "Variable to Add Sell Value To",
        exemptObjects: ["consumable", "card"],
        variableTypes: ["number"],
      },
      {
        id: "animation",
        type: "select",
        label: "Animation",
        options: [
            { value: "start_dissolve", label: "Dissolve" },
            { value: "shatter", label: "Shatter" },
            { value: "explode", label: "Explode" },
          ],
        default : "start_dissolve",
        exemptObjects: ["consumable", "card"]
      }
    ],
    category: "Jokers",
  },
  {
    id: "flip_joker",
    label: "Flip Joker",
    description: "Flip a joker",
    applicableTriggers: [...GENERIC_TRIGGERS, "card_used"],
    objectUsers: ["joker", "consumable"],
    params: [
      {
        id: "selection_method",
        type: "select",
        label: "Selection Method",
        options: [
          { value: "all", label: "All Jokers" },
          { value: "random", label: "Random Joker" },
          { value: "self", label: "This Joker", exempt: ["consumable"] },
          { value: "position", label: "By Position" },
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
          { value: "left", label: "Left of This Joker", exempt: ["consumable"]},
          { value: "right", label: "Right of This Joker", exempt: ["consumable"] },
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
    applicableTriggers: [...GENERIC_TRIGGERS, "card_used"],
    objectUsers: ["joker", "consumable"],
    params: [],
    category: "Jokers",
  },
  {
    id: "unlock_joker",
    label: "Unlock Joker",
    description: "Unlock a locked joker in the collection ",
    objectUsers: ["joker"],
    applicableTriggers: [...GENERIC_TRIGGERS],
    params: [
      {
        id: "selection_method",
        type: "select",
        label: "Selection Method",
        default: "key",
        options: [
          { value: "key", label: "Joker Key" },
          { value: "variable", label: "Key Variable" },
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
        id: "key_variable",
        type: "select",
        label: "Key Variable",
        showWhen: {
          parameter: "selection_method",
          values: ["variable"],
        },
        variableTypes: ["key"]
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
]