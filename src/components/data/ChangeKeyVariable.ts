import { GlobalEffectTypeDefinition } from "../ruleBuilder/types";
import { CONSUMABLE_SETS, RARITIES } from "./BalatroUtils";
import { GENERIC_TRIGGERS } from "./Conditions";

  
export const CHANGE_KEY_VAR_EFFECT: GlobalEffectTypeDefinition = {
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
      label: "Key Type",
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
        { value: "rarity", label: "Random from specific Rarity" },
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
      options: [],
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
    // CONSUMABLES
    {
      id: "consumable_change_type",
      type: "select",
      label: "Change Type (Consumable)",
      options: [
        { value: "random", label: "Random Consumable" }, 
        { value: "specific", label: "Specific Consumable Key" },
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
        ...CONSUMABLE_SETS().map(set => {return { value: set.value, label: set.label }})
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
    // ENHANCEMENTS
    {
      id: "enhancement_change_type",
      type: "select",
      label: "Change Type (Enhancement)",
      options: [
        { value: "random", label: "Random Enhancement" }, 
        { value: "specific", label: "Specific Enhancement Key" },
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
    // SEALS
    {
      id: "seal_change_type",
      type: "select",
      label: "Change Type (Seals)",
      options: [
        { value: "random", label: "Random Seal" }, 
        { value: "specific", label: "Specific Seal Key" },
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
    // EDITIONS
    {
      id: "edition_change_type",
      type: "select",
      label: "Change Type (Editions)",
      options: [
        { value: "random", label: "Random Edition" }, 
        { value: "specific", label: "Specific Edition Key" },
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
    // VOUCHERS
    {
      id: "voucher_change_type",
      type: "select",
      label: "Change Type (Voucher)",
      options: [
        { value: "random", label: "Random Vouchers" }, 
        { value: "specific", label: "Specific Voucher Key" },
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
        { value: "possible", label: "Random from All Possible Vouchers" },
        { value: "redeemed", label: "Random from Redeemed Vouchers" },
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
    // BOOSTERS
    {
      id: "booster_change_type",
      type: "select",
      label: "Change Type (Booster)",
      options: [
        { value: "random", label: "Random Booster" }, 
        { value: "specific", label: "Specific Booster Key" },
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
      ],
      default: "all",
      showWhen: {
        parameter: "booster_change_type",
        values: ["random"],
      },
    },
    {
      id: "booster_category",
      type: "text",
      label: "Booster Category",
      showWhen: {
        parameter: "booster_random_type",
        values: ["category"],
      },
    }, // FIGURE OUT THIS LATER
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
      id: "tag_change_type",
      type: "select",
      label: "Change Type (Tag)",
      options: [
        { value: "random", label: "Random Tag" }, 
        { value: "specific", label: "Specific Tag Key" },
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
  ],
  category: "Variables",
}