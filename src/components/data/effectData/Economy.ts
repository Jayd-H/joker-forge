import { GlobalEffectTypeDefinition } from "../../ruleBuilder/types";
import { ALL_OBJECTS, GENERIC_TRIGGERS } from "./../Conditions";

  
export const ECONOMY_EFFECTS: GlobalEffectTypeDefinition[] = [
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
]