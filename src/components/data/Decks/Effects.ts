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
  VOUCHERS,
  RARITIES,
  EDITIONS,
  STICKERS,
  CONSUMABLE_SETS,
  TAROT_CARDS,
  PLANET_CARDS,
  CUSTOM_CONSUMABLES,
  SPECTRAL_CARDS,
} from "../BalatroUtils";

export const DECK_EFFECT_CATEGORIES: CategoryDefinition[] = [
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

export const DECK_EFFECT_TYPES: EffectTypeDefinition[] = [

  // ===== HAND EFFECTS =====
  {
    id: "edit_hand_size",
    label: "Edit Hand Size",
    description: "Add, subtract, or set the player's hand size",
    applicableTriggers: ["deck_selected"],
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
    id: "edit_play_size",
    label: "Edit Play Size",
    description: "Add, subtract, or set the player's play size",
    applicableTriggers: ["deck_selected"],
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
    applicableTriggers: ["deck_selected"],
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
    id: "edit_hands_money",
    label: "Edit Hand Money",
    description: "Add, subtract, or set the player's end of the round hand money",
    applicableTriggers: ["deck_selected"],
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
    description: "Add, subtract, or set the player's end of the round discard money",
    applicableTriggers: ["deck_selected"],
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
    id: "edit_voucher_slots",
    label: "Edit Voucher Slots",
    description: "Modify the number of vouchers available in shop",
    applicableTriggers: ["deck_selected"],
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
    applicableTriggers: ["deck_selected"],
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
      description: "Modify the run start ante level",
      applicableTriggers: ["deck_selected"],
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
    id: "edit_rerolls",
    label: "Edit Reroll Price",
    description: "Modify the price of the shop Reroll",
    applicableTriggers: ["deck_selected"],
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
    category: "Economy",
  },
  {
    id: "redeem_voucher",
    label: "Starting Voucher",
    description: "Start the run with a specific or random voucher",
    applicableTriggers: ["deck_selected"],
    params: [
      {
        id: "specific_voucher",
        type: "select",
        label: "Specific Voucher",
        options: [...VOUCHERS()],
        default: "v_overstock_norm",
      },
    ],
    category: "Consumables",
  },
    {
        id: "edit_raity_weight",
        label: "Edit Rarity Weight",
        description: "Modify the Rate Probability for Joker Raritys in the Shop",
        applicableTriggers: ["deck_selected"],
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
        category: "Shop Effects",
      },
    {
        id: "edit_item_weight",
        label: "Edit Card Weight",
        description: "Modify the Rate Probability for Shop Cards",
        applicableTriggers: ["deck_selected"],
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
        category: "Shop Effects",
    },
    {
        id: "edit_win_ante",
        label: "Set Winner Ante",
        description: "Set the Final Ante where the Player Win's the Game",
        applicableTriggers: ["deck_selected"],
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
      id: "edit_consumable_slots",
      label: "Edit Consumable Slots",
      description: "Modify the number of consumable slots available",
      applicableTriggers: ["deck_selected"],
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
    id: "edit_hands",
    label: "Edit Hands",
    description: "Add, subtract, or set the player's hands for this run",
    applicableTriggers: ["deck_selected"],
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
    id: "edit_discards",
    label: "Edit Discards",
    description: "Add, subtract, or set the player's discards for this run",
    applicableTriggers: ["deck_selected"],
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

  // ===== OTHER EFFECTS =====
  {
    id: "edit_joker_slots",
    label: "Edit Joker Slots",
    description: "Add or remove joker slots available in the run",
    applicableTriggers: ["deck_selected"],
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
    id: "modify_blind_requirement",
    label: "Modify Base Blind Requirement",
    description: "Changes the score requirement of Base blind",
    applicableTriggers: ["deck_selected"],
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
      id: "create_consumable",
      label: "Starting Consumable",
      description:
        "Start the run with consumable cards and add them to your consumables area",
      applicableTriggers: ["deck_selected"],
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
      id: "create_joker",
      label: "Starting Joker",
      description:
        "Start the run with a random or specific joker card. For creating jokers from your own mod, it is [modprefix]_[joker_name]. You can find your mod prefix in the mod metadata page.",
      applicableTriggers: ["deck_selected"],
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
    id: "edit_dollars",
    label: "Edit Starting Dollars",
    description: "Add, subtract, or set the player's Starting money",
    applicableTriggers: ["deck_selected"],
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
    id: "emit_flag",
    label: "Emit Flag",
    description:
      "Emit a custom flag. Flags are global variables that can be set to true or false and checked by any other jokers",
    applicableTriggers: ["deck_selected"],
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
    id: "edit_card_apperance",
    label: "Edit Card Apperance",
    description: "Modify if a Card can appear or not the current Run",
    applicableTriggers: ["deck_selected"],
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
      id: "play_sound",
      label: "Play a sound",
      description: "Play a specific sound defined in the Sound Tab",
      applicableTriggers: ["deck_selected"],
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

export function getDeckEffectsForTrigger(
  triggerId: string
): EffectTypeDefinition[] {
  return DECK_EFFECT_TYPES.filter((effect) =>
    effect.applicableTriggers?.includes(triggerId)
  );
}

export function getDeckEffectTypeById(
  id: string
): EffectTypeDefinition | undefined {
  return DECK_EFFECT_TYPES.find((effect) => effect.id === id);
}
