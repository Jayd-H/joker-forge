import { GlobalEffectTypeDefinition } from "../../ruleBuilder/types";

export const SCORING_EFFECTS: GlobalEffectTypeDefinition[] = [
  {
    id: "add_chips",
    label: "Add Chips",
    description: "Add a flat amount of chips to the hand score",
    objectUsers: ["joker", "consumable", "card"],
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "joker_evaluated",
    ],
    params: [
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 10,
        min: 0,
      },
    ],
    category: "Scoring",
  },
  {
    id: "apply_x_chips",
    label: "Apply xChips",
    description: "Multiply the chips by this value",
    objectUsers: ["joker", "consumable", "card"],
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "joker_evaluated",
    ],
    params: [
      {
        id: "value",
        type: "number",
        label: "Multiplier",
        default: 1.5,
      },
    ],
    category: "Scoring",
  },
  {
    id: "apply_exp_chips",
    label: "Apply ^Chips (Exponential)",
    description: "Apply exponential chips (echips) - REQUIRES TALISMAN MOD",
    objectUsers: ["joker", "consumable", "card"],
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "joker_evaluated",
    ],
    params: [
      {
        id: "value",
        type: "number",
        label: "Exponential Chips Value",
        default: 1.1,
      },
    ],
    category: "Scoring",
  },
  {
    id: "apply_hyper_chips",
    label: "Apply HyperChips",
    description: "Apply (n)^ chips - REQUIRES TALISMAN MOD",
    objectUsers: ["joker", "consumable", "card"],
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "joker_evaluated",
    ],
    params: [
      {
        id: "arrows",
        type: "number",
        label: "Number of Arrows",
        default: 1,
        min: 1
      },
      {
        id: "value",
        type: "number",
        label: "Hyper Chips Value",
        default: 1.1,
      },
    ],
    category: "Scoring",
  },
  {
    id: "add_mult",
    label: "Add Mult",
    description: "Add a flat amount of mult to the hand score",
    objectUsers: ["joker", "consumable", "card"],
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "joker_evaluated",
    ],
    params: [
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 5,
        min: 0,
      },
    ],
    category: "Scoring",
  },
  {
    id: "apply_x_mult",
    label: "Apply xMult",
    description: "Multiply the score by this value",
    objectUsers: ["joker", "consumable", "card"],
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "joker_evaluated",
    ],
    params: [
      {
        id: "value",
        type: "number",
        label: "Multiplier",
        default: 1.5,
      },
    ],
    category: "Scoring",
  },
  {
    id: "apply_exp_mult",
    label: "Apply ^Mult (Exponential)",
    description: "Apply exponential mult (emult) - REQUIRES TALISMAN MOD",
    objectUsers: ["joker", "consumable", "card"],
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "joker_evaluated",
    ],
    params: [
      {
        id: "value",
        type: "number",
        label: "Exponential Mult Value",
        default: 1.1,
      },
    ],
    category: "Scoring",
  },
  {
    id: "apply_hyper_mult",
    label: "Apply HyperMult",
    description: "Apply (n)^ mult - REQUIRES TALISMAN MOD",
    objectUsers: ["joker", "consumable", "card"],
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "joker_evaluated",
    ],
    params: [
      {
        id: "arrows",
        type: "number",
        label: "Number of Arrows",
        default: 1,
        min: 1
      },
      {
        id: "value",
        type: "number",
        label: "Hyper Mult Value",
        default: 1.1,
      },
    ],
    category: "Scoring",
  },
  {
    id: "balance_chips_mult",
    label: "Balance Chips and Mult",
    description: "Plasma Deck effect",
    objectUsers: ["joker", "card"],
    applicableTriggers: [
      "hand_played",
      "card_scored",
      "card_held_in_hand",
      "card_held_in_hand_end_of_round",
      "joker_evaluated",
      "before_hand_played",
      "after_hand_played",
    ],
    params: [],
    category: "Scoring",
  },
  {
    id: "swap_chips_mult",
    label: "Swap Chips and Mult",
    description: "Swap the Chips and Mult values",
    objectUsers: ["joker", "card"],
    applicableTriggers: [
    "hand_played",
    "card_scored",
    "card_held_in_hand",
    "card_held_in_hand_end_of_round",
    "joker_evaluated",
    "before_hand_played",
    "after_hand_played",
  ],
    params: [],
    category: "Scoring",
  },
]