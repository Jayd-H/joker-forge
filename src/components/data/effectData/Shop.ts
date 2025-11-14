import { GlobalEffectTypeDefinition } from "../../ruleBuilder/types";
import { GENERIC_TRIGGERS } from "./../Conditions";

  
export const SHOP_EFFECTS: GlobalEffectTypeDefinition[] = [
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
    id: "edit_reroll_price",
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
    id: "edit_rarity_weight",
    label: "Edit Rarity Weight",
    description: "Modify the Rate Probability for Joker Rarities in the Shop",
    objectUsers: ["voucher", "deck"],
    applicableTriggers: ["card_used"],
    params: [
      {
          id: "key",
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
  {
    id: "add_booster_shop",
    label: "Add Booster Pack Into Shop",
    description: "Add a Booster Pack into the current Shop",
    objectUsers: ["joker"],
    applicableTriggers: ["shop_entered", "shop_reroll", "card_bought", ],
    params: [
      {
        id: "method_type",
        type: "select",
        label: "Selection Method",
        options: [
          { value: "random", label: "Random Booster Pack"},
          { value: "specific", label: "Specific Booster Key"},
          { value: "key_var", label: "Key Variable"},
        ],
        default: "random"
      },
      {
        id: "key_variable",
        type: "select",
        label: "Key Variable",
        variableTypes: ["key"]
      },
      {
        id: "specific_key",
        type: "text",
        label: "Booster Key",
        default: "",
      },
    ],
    category: "Shop",
  },
]