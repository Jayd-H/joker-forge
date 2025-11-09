interface TriggerDefinition {
  condition: string;
  context: string;
  description: string;
}

const TRIGGER_DEFINITIONS: Record<string, TriggerDefinition> = {
  card_scored: {
    condition: "context.main_scoring and context.cardarea == G.play",
    context: "scoring context",
    description: "When this card is part of a scoring hand",
  },
  card_held: {
    condition: "context.cardarea == G.hand and context.main_scoring",
    context: "hand context",
    description: "When this card is held in the player's hand",
  },
  card_held_in_hand_end_of_round: {
    condition:
      "context.end_of_round and context.cardarea == G.hand and context.other_card == card and context.individual",
    context: "end of round context",
    description: "When this card is held in hand at the end of the round",
  },
  card_discarded: {
    condition: "context.discard and context.other_card == card",
    context: "discard context",
    description:
      "Triggers whenever a card is discarded. Use conditions to check properties of the discarded card.",
  },
};

export const generateTriggerCondition = (
  trigger: string,
  itemType?: "enhancement" | "seal" | "edition"
): string => {
  if (trigger === "card_scored" && itemType === "edition") {
    return "context.pre_joker or (context.main_scoring and context.cardarea == G.play)";
  }
  return TRIGGER_DEFINITIONS[trigger]?.condition || "";
};
