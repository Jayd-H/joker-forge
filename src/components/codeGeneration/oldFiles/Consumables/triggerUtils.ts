interface TriggerContext {
  condition: string;
  context: string;
  description: string;
}

export const generateTriggerContext = (
  triggerType: string,
): TriggerContext => {
   switch (triggerType) {
  case "held_hand":
      return {
        condition: `context.joker_main`,
        context: "hand context",
        description: "-- 'while consumable held in hand",
      };
  default:
      return {
        condition: "",
        context: "",
        description: "",
      };
  }
}

const TRIGGER_DEFINITIONS: { [key: string]: { condition: string } } = {
  held_hand: { condition: "context.joker_main" },
};

export const generateTriggerCondition = (
  trigger: string,
): string => {
  return TRIGGER_DEFINITIONS[trigger]?.condition || "";
};
