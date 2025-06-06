import { EffectTypeDefinition } from "../types";

// Effect types and their possible parameters
export const EFFECT_TYPES: EffectTypeDefinition[] = [
  {
    id: "add_chips",
    label: "Add Chips",
    description: "Add a flat amount of chips to the hand score",
    applicableTriggers: ["hand_played", "card_scored", "passive"],
    params: [
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 10,
        min: 0,
      },
    ],
  },
  {
    id: "add_mult",
    label: "Add Mult",
    description: "Add a flat amount of mult to the hand score",
    applicableTriggers: ["hand_played", "card_scored", "passive"],
    params: [
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 5,
        min: 0,
      },
    ],
  },
  {
    id: "apply_x_mult",
    label: "Apply xMult",
    description: "Multiply the score by this value",
    applicableTriggers: ["hand_played", "card_scored", "passive"],
    params: [
      {
        id: "value",
        type: "number",
        label: "Multiplier",
        default: 1.5,
        min: 0.1,
        max: 10,
      },
    ],
  },
  {
    id: "add_dollars",
    label: "Add Dollars",
    description: "Add money directly to your balance",
    params: [
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 5,
        min: 0,
      },
    ],
  },
  {
    id: "retrigger_cards",
    label: "Retrigger",
    description:
      "Retrigger the scored card (only for 'When a Card is Scored' trigger)",
    applicableTriggers: ["card_scored"],
    params: [
      {
        id: "repetitions",
        type: "number",
        label: "Repetitions",
        default: 1,
        min: 1,
        max: 10,
      },
    ],
  },
  {
    id: "level_up_hand",
    label: "Level Up Hand",
    description: "Increase the level of the played hand",
    applicableTriggers: ["hand_played"],
    params: [
      {
        id: "value",
        type: "number",
        label: "Levels",
        default: 1,
        min: 1,
      },
    ],
  },
  {
    id: "edit_hand",
    label: "Edit Hands",
    description: "Modify the number of hands available",
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
  },
  {
    id: "edit_discard",
    label: "Edit Discards",
    description: "Modify the number of discards available",
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
  },
  {
    id: "modify_internal_variable",
    label: "Modify Internal Variable",
    description: "Change an internal variable value for this joker",
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
  },
  {
    id: "add_card_to_deck",
    label: "Add Card to Deck",
    description: "Create a new playing card and add it to your deck",
    params: [
      {
        id: "suit",
        type: "select",
        label: "Suit",
        options: [
          { value: "random", label: "Random" },
          { value: "Spades", label: "Spades" },
          { value: "Hearts", label: "Hearts" },
          { value: "Diamonds", label: "Diamonds" },
          { value: "Clubs", label: "Clubs" },
        ],
        default: "random",
      },
      {
        id: "rank",
        type: "select",
        label: "Rank",
        options: [
          { value: "random", label: "Random" },
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
          { value: "5", label: "5" },
          { value: "6", label: "6" },
          { value: "7", label: "7" },
          { value: "8", label: "8" },
          { value: "9", label: "9" },
          { value: "T", label: "10" },
          { value: "J", label: "Jack" },
          { value: "Q", label: "Queen" },
          { value: "K", label: "King" },
          { value: "A", label: "Ace" },
        ],
        default: "random",
      },
      {
        id: "enhancement",
        type: "select",
        label: "Enhancement",
        options: [
          { value: "none", label: "None" },
          { value: "random", label: "Random" },
          { value: "m_gold", label: "Gold" },
          { value: "m_steel", label: "Steel" },
          { value: "m_glass", label: "Glass" },
          { value: "m_wild", label: "Wild" },
          { value: "m_mult", label: "Mult" },
          { value: "m_lucky", label: "Lucky" },
          { value: "m_stone", label: "Stone" },
        ],
        default: "none",
      },
      {
        id: "seal",
        type: "select",
        label: "Seal",
        options: [
          { value: "none", label: "None" },
          { value: "random", label: "Random" },
          { value: "Gold", label: "Gold Seal" },
          { value: "Red", label: "Red Seal" },
          { value: "Blue", label: "Blue Seal" },
          { value: "Purple", label: "Purple Seal" },
        ],
        default: "none",
      },
      {
        id: "edition",
        type: "select",
        label: "Edition",
        options: [
          { value: "none", label: "None" },
          { value: "random", label: "Random" },
          { value: "e_foil", label: "Foil" },
          { value: "e_holo", label: "Holographic" },
          { value: "e_polychrome", label: "Polychrome" },
          { value: "e_negative", label: "Negative" },
        ],
        default: "none",
      },
    ],
  },
  {
    id: "copy_triggered_card",
    label: "Copy Triggered Card",
    description: "Copy the card that triggered this effect to your deck",
    applicableTriggers: ["card_scored", "card_discarded"],
    params: [],
  },
  {
    id: "copy_played_card",
    label: "Copy Played Card",
    description: "Copy a specific card from the played hand to your deck",
    applicableTriggers: ["hand_played"],
    params: [
      {
        id: "card_index",
        type: "select",
        label: "Position in Hand",
        options: [
          { value: "any", label: "Any Position" },
          { value: "1", label: "1st Card" },
          { value: "2", label: "2nd Card" },
          { value: "3", label: "3rd Card" },
          { value: "4", label: "4th Card" },
          { value: "5", label: "5th Card" },
        ],
        default: "any",
      },
      {
        id: "card_rank",
        type: "select",
        label: "Rank",
        options: [
          { value: "any", label: "Any Rank" },
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
          { value: "5", label: "5" },
          { value: "6", label: "6" },
          { value: "7", label: "7" },
          { value: "8", label: "8" },
          { value: "9", label: "9" },
          { value: "10", label: "10" },
          { value: "J", label: "Jack" },
          { value: "Q", label: "Queen" },
          { value: "K", label: "King" },
          { value: "A", label: "Ace" },
        ],
        default: "any",
      },
      {
        id: "card_suit",
        type: "select",
        label: "Suit",
        options: [
          { value: "any", label: "Any Suit" },
          { value: "Spades", label: "Spades" },
          { value: "Hearts", label: "Hearts" },
          { value: "Diamonds", label: "Diamonds" },
          { value: "Clubs", label: "Clubs" },
        ],
        default: "any",
      },
    ],
  },
  {
    id: "delete_triggered_card",
    label: "Delete Triggered Card",
    description: "Delete the card that triggered this effect",
    applicableTriggers: ["card_scored", "card_discarded"],
    params: [],
  },
  {
    id: "edit_triggered_card",
    label: "Edit Triggered Card",
    description: "Modify the properties of the card that triggered this effect",
    applicableTriggers: ["card_scored", "card_discarded"],
    params: [
      {
        id: "new_rank",
        type: "select",
        label: "New Rank",
        options: [
          { value: "none", label: "Don't Change" },
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
          { value: "5", label: "5" },
          { value: "6", label: "6" },
          { value: "7", label: "7" },
          { value: "8", label: "8" },
          { value: "9", label: "9" },
          { value: "10", label: "10" },
          { value: "J", label: "Jack" },
          { value: "Q", label: "Queen" },
          { value: "K", label: "King" },
          { value: "A", label: "Ace" },
        ],
        default: "none",
      },
      {
        id: "new_suit",
        type: "select",
        label: "New Suit",
        options: [
          { value: "none", label: "Don't Change" },
          { value: "Spades", label: "Spades" },
          { value: "Hearts", label: "Hearts" },
          { value: "Diamonds", label: "Diamonds" },
          { value: "Clubs", label: "Clubs" },
        ],
        default: "none",
      },
      {
        id: "new_enhancement",
        type: "select",
        label: "New Enhancement",
        options: [
          { value: "none", label: "Don't Change" },
          { value: "remove", label: "Remove Enhancement" },
          { value: "m_gold", label: "Gold" },
          { value: "m_steel", label: "Steel" },
          { value: "m_glass", label: "Glass" },
          { value: "m_wild", label: "Wild" },
          { value: "m_mult", label: "Mult" },
          { value: "m_lucky", label: "Lucky" },
          { value: "m_stone", label: "Stone" },
        ],
        default: "none",
      },
      {
        id: "new_seal",
        type: "select",
        label: "New Seal",
        options: [
          { value: "none", label: "Don't Change" },
          { value: "remove", label: "Remove Seal" },
          { value: "Gold", label: "Gold Seal" },
          { value: "Red", label: "Red Seal" },
          { value: "Blue", label: "Blue Seal" },
          { value: "Purple", label: "Purple Seal" },
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
          { value: "e_foil", label: "Foil" },
          { value: "e_holo", label: "Holographic" },
          { value: "e_polychrome", label: "Polychrome" },
          { value: "e_negative", label: "Negative" },
        ],
        default: "none",
      },
    ],
  },
  {
    id: "create_tarot_card",
    label: "Create Tarot Card",
    description: "Create a specific or random Tarot card",
    params: [
      {
        id: "tarot_card",
        type: "select",
        label: "Tarot Card",
        options: [
          { value: "random", label: "Random Tarot Card" },
          {
            value: "the_fool",
            label: "The Fool - Creates last Tarot/Planet used",
          },
          {
            value: "the_magician",
            label: "The Magician - Enhance 2 cards to Lucky",
          },
          {
            value: "the_high_priestess",
            label: "The High Priestess - Create 2 Planet cards",
          },
          {
            value: "the_empress",
            label: "The Empress - Enhance 2 cards to Mult",
          },
          { value: "the_emperor", label: "The Emperor - Create 2 Tarot cards" },
          {
            value: "the_hierophant",
            label: "The Hierophant - Enhance 2 cards to Bonus",
          },
          { value: "the_lovers", label: "The Lovers - Enhance 1 card to Wild" },
          {
            value: "the_chariot",
            label: "The Chariot - Enhance 1 card to Steel",
          },
          { value: "justice", label: "Justice - Enhance 1 card to Glass" },
          { value: "the_hermit", label: "The Hermit - Double money (Max $20)" },
          {
            value: "the_wheel_of_fortune",
            label: "Wheel of Fortune - 1/4 chance add edition to Joker",
          },
          {
            value: "strength",
            label: "Strength - Increase rank of 2 cards by 1",
          },
          {
            value: "the_hanged_man",
            label: "The Hanged Man - Destroy 2 cards",
          },
          {
            value: "death",
            label: "Death - Convert left card into right card",
          },
          {
            value: "temperance",
            label: "Temperance - Gain Jokers' sell value (Max $50)",
          },
          { value: "the_devil", label: "The Devil - Enhance 1 card to Gold" },
          { value: "the_tower", label: "The Tower - Enhance 1 card to Stone" },
          {
            value: "the_star",
            label: "The Star - Convert 3 cards to Diamonds",
          },
          { value: "the_moon", label: "The Moon - Convert 3 cards to Clubs" },
          { value: "the_sun", label: "The Sun - Convert 3 cards to Hearts" },
          { value: "judgement", label: "Judgement - Create random Joker" },
          {
            value: "the_world",
            label: "The World - Convert 3 cards to Spades",
          },
        ],
        default: "random",
      },
    ],
  },
  {
    id: "create_planet_card",
    label: "Create Planet Card",
    description: "Create a specific or random Planet card",
    params: [
      {
        id: "planet_card",
        type: "select",
        label: "Planet Card",
        options: [
          { value: "random", label: "Random Planet Card" },
          { value: "pluto", label: "Pluto - High Card (+1 Mult, +10 Chips)" },
          { value: "mercury", label: "Mercury - Pair (+1 Mult, +15 Chips)" },
          { value: "uranus", label: "Uranus - Two Pair (+1 Mult, +20 Chips)" },
          {
            value: "venus",
            label: "Venus - Three of a Kind (+2 Mult, +20 Chips)",
          },
          { value: "saturn", label: "Saturn - Straight (+3 Mult, +30 Chips)" },
          { value: "jupiter", label: "Jupiter - Flush (+2 Mult, +15 Chips)" },
          { value: "earth", label: "Earth - Full House (+2 Mult, +25 Chips)" },
          {
            value: "mars",
            label: "Mars - Four of a Kind (+3 Mult, +30 Chips)",
          },
          {
            value: "neptune",
            label: "Neptune - Straight Flush (+4 Mult, +40 Chips)",
          },
          {
            value: "planet_x",
            label: "Planet X - Five of a Kind (+3 Mult, +35 Chips)",
          },
          { value: "ceres", label: "Ceres - Flush House (+4 Mult, +40 Chips)" },
          { value: "eris", label: "Eris - Flush Five (+3 Mult, +50 Chips)" },
        ],
        default: "random",
      },
    ],
  },
  {
    id: "create_spectral_card",
    label: "Create Spectral Card",
    description: "Create a specific or random Spectral card",
    params: [
      {
        id: "spectral_card",
        type: "select",
        label: "Spectral Card",
        options: [
          { value: "random", label: "Random Spectral Card" },
          {
            value: "familiar",
            label: "Familiar - Destroy 1 card, add 3 Enhanced face cards",
          },
          {
            value: "grim",
            label: "Grim - Destroy 1 card, add 2 Enhanced Aces",
          },
          {
            value: "incantation",
            label:
              "Incantation - Destroy 1 card, add 4 Enhanced numbered cards",
          },
          { value: "talisman", label: "Talisman - Add Gold Seal to 1 card" },
          { value: "aura", label: "Aura - Add random edition to 1 card" },
          {
            value: "wraith",
            label: "Wraith - Create Rare Joker, set money to $0",
          },
          {
            value: "sigil",
            label: "Sigil - Convert all cards to single random suit",
          },
          {
            value: "ouija",
            label: "Ouija - Convert all cards to single rank, -1 Hand Size",
          },
          {
            value: "ectoplasm",
            label: "Ectoplasm - Add Negative to random Joker, -1 Hand Size",
          },
          { value: "immolate", label: "Immolate - Destroy 5 cards, gain $20" },
          { value: "ankh", label: "Ankh - Copy 1 Joker, destroy others" },
          { value: "deja_vu", label: "Deja Vu - Add Red Seal to 1 card" },
          {
            value: "hex",
            label: "Hex - Add Polychrome to random Joker, destroy rest",
          },
          { value: "trance", label: "Trance - Add Blue Seal to 1 card" },
          { value: "medium", label: "Medium - Add Purple Seal to 1 card" },
          {
            value: "cryptid",
            label: "Cryptid - Create 2 copies of selected card",
          },
          { value: "the_soul", label: "The Soul - Create Legendary Joker" },
          {
            value: "black_hole",
            label: "Black Hole - Upgrade all poker hands by 1 level",
          },
        ],
        default: "random",
      },
    ],
  },
  {
    id: "destroy_self",
    label: "Destroy Self",
    description: "Destroy this joker",
    params: [],
  },
  {
    id: "modify_game_rules",
    label: "Modify Game Rules",
    description: "Change fundamental game rules",
    applicableTriggers: ["hand_played", "blind_selected", "passive"],
    params: [
      {
        id: "rule_type",
        type: "select",
        label: "Rule Type",
        options: [
          { value: "hand_size", label: "Hand Size" },
          { value: "flush_requirement", label: "Flush Requirement" },
          { value: "straight_requirement", label: "Straight Requirement" },
          { value: "card_behavior", label: "Card Behavior" },
        ],
      },
      {
        id: "hand_size_value",
        type: "number",
        label: "New Hand Size",
        showWhen: {
          parameter: "rule_type",
          values: ["hand_size"],
        },
        default: 4,
        min: 1,
        max: 10,
      },
      {
        id: "flush_value",
        type: "number",
        label: "Cards for Flush",
        showWhen: {
          parameter: "rule_type",
          values: ["flush_requirement"],
        },
        default: 4,
        min: 3,
        max: 5,
      },
      {
        id: "straight_value",
        type: "number",
        label: "Cards for Straight",
        showWhen: {
          parameter: "rule_type",
          values: ["straight_requirement"],
        },
        default: 4,
        min: 3,
        max: 5,
      },
      {
        id: "card_behavior_type",
        type: "select",
        label: "Behavior",
        showWhen: {
          parameter: "rule_type",
          values: ["card_behavior"],
        },
        options: [
          { value: "all_face", label: "All Cards are Face Cards" },
          { value: "all_aces", label: "All Cards are Aces" },
          { value: "all_wild", label: "All Cards are Wild" },
        ],
      },
    ],
  },
];

// Helper function to get a specific effect type by ID
export function getEffectTypeById(
  id: string
): EffectTypeDefinition | undefined {
  return EFFECT_TYPES.find((effectType) => effectType.id === id);
}

// Helper function to get effects applicable to a specific trigger
export function getEffectsForTrigger(
  triggerId: string
): EffectTypeDefinition[] {
  return EFFECT_TYPES.filter(
    (effect) =>
      !effect.applicableTriggers ||
      effect.applicableTriggers.includes(triggerId)
  );
}
