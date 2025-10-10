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


export const VOUCHER_EFFECT_CATEGORIES: CategoryDefinition[] = [
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

export const VOUCHER_EFFECT_TYPES: EffectTypeDefinition[] = [

  // ===== HAND EFFECTS =====
  {
    id: "edit_hand_size",
    label: "Edit Hand Size",
    description: "Add, subtract, or set the player's hand size",
    applicableTriggers: ["voucher_used"],
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
    applicableTriggers: ["voucher_used"],
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
    applicableTriggers: ["voucher_used"],
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
    applicableTriggers: ["voucher_used"],
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
    applicableTriggers: ["voucher_used"],
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
    id: "edit_booster_packs",
    label: "Edit Boosters Packs",
    description: "Modify the values the of booster packs available in shop",
    applicableTriggers: ["voucher_used"],
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
    category: "Shop Effects",
  },
  {
    id: "edit_interest_cap",
    label: "Edit Interest Cap",
    description: "Modify the Cap on Interest Earned in each round",
    applicableTriggers: ["voucher_used"],
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
      id: "set_ante",
      label: "Set Ante Level",
      description: "Modify the current ante level",
      applicableTriggers: ["voucher_used"],
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
    id: "free_rerolls",
    label: "Free Rerolls",
    description: "Provide free shop rerolls",
    applicableTriggers: ["voucher_used"],
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
    id: "edit_raity_weight",
    label: "Edit Rarity Weight",
    description: "Modify the Rate Probability for Joker Raritys in the Shop",
    applicableTriggers: ["voucher_used"],
    params: [
      {
          id: "key_rarity",
          type: "text",
          label: "Joker Rarity Key (modprefix_key)",
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
    applicableTriggers: ["voucher_used"],
    params: [
      {
          id: "key",
          type: "text",
          label: "Card Key (modprefix_key)",
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
    id: "edit_rerolls",
    label: "Edit Reroll Price",
    description: "Modify the price of the shop Reroll",
    applicableTriggers: ["voucher_used"],
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
      id: "edit_consumable_slots",
      label: "Edit Consumable Slots",
      description: "Modify the number of consumable slots available",
      applicableTriggers: ["voucher_used"],
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
    id: "edit_shop_slots",
    label: "Edit Shop Cards Slots",
    description: "Modify the Card slots of the shop ",
    applicableTriggers: ["voucher_used"],
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
    id: "edit_hands",
    label: "Edit Hands",
    description: "Add, subtract, or set the player's hands for this round",
    applicableTriggers: ["voucher_used"],
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
    description: "Add, subtract, or set the player's discards for this round",
    applicableTriggers: ["voucher_used"],
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
    description: "Add or remove joker slots available in the game",
    applicableTriggers: ["voucher_used"],
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
        id: "edit_win_ante",
        label: "Set Winner Ante",
        description: "Set the Final Ante where the Player Win's the Game",
        applicableTriggers: ["voucher_used"],
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
    id: "edit_dollars",
    label: "Edit Dollars",
    description: "Add, subtract, or set the player's money",
    applicableTriggers: ["voucher_used"],
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
    applicableTriggers: ["voucher_used"],
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
      applicableTriggers: ["voucher_used"],
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

export function getVoucherEffectsForTrigger(
  triggerId: string
): EffectTypeDefinition[] {
  return VOUCHER_EFFECT_TYPES.filter((effect) =>
    effect.applicableTriggers?.includes(triggerId)
  );
}

export function getVoucherEffectTypeById(
  id: string
): EffectTypeDefinition | undefined {
  return VOUCHER_EFFECT_TYPES.find((effect) => effect.id === id);
}
