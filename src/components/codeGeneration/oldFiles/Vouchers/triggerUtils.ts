interface TriggerContext {
  condition: string;
  context: string;
  description: string;
}

export const generateTriggerContext = (
  triggerType: string,
): TriggerContext => {
   switch (triggerType) {
  case "blind_selected":
      return {
        condition: `context.setting_blind`,
        context: "gameplay context",
        description: "-- When blind is selected",
      };
      case "blind_skipped":
      return {
        condition: `context.skip_blind`,
        context: "gameplay context",
        description: "-- When blind is skipped",
      };
  case "booster_opened":
      return {
        condition: `context.open_booster`,
        context: "boosters and Consumables context",
        description: "-- When booster pack is opened",
      };
      case "booster_skipped":
      return {
        condition: `context.skipping_booster`,
        context: "boosters and Consumables context",
        description: "-- When booster pack is skipped",
      };
  case "shop_entered":
      return {
        condition: `context.starting_shop`,
        context: "shop context",
        description: "-- When entering shop",
      };
      case "shop_exited":
      return {
        condition: `context.ending_shop`,
        context: "shop context",
        description: "-- When exiting shop",
      };
  case "round_end":
      return {
        condition:
          `context.end_of_round and context.game_over == false and context.main_eval`,
        context: "end of round context",
        description: "-- At the end of the round",
      };
      case "boss_defeated":
      return {
        condition:
          `context.end_of_round and context.main_eval and G.GAME.blind.boss`,
          context: "end of round context",
        description: "-- After boss blind is defeated",
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
  blind_selected: { condition: "context.setting_blind" },
  booster_opened: { condition: "context.open_booster" },
  shop_entered: { condition: "context.starting_shop" },
  round_end: { condition: "context.end_of_round and context.game_over == false and context.main_eval" },
  boss_defeated: { condition: "context.end_of_round and context.main_eval and G.GAME.blind.boss" },
  blind_skipped: { condition: "context.skip_blind" },
  booster_skipped: { condition: "context.skipping_booster" },
  shop_exited: { condition: "context.ending_shop" },
};

export const generateTriggerCondition = (
  trigger: string,
): string => {
  return TRIGGER_DEFINITIONS[trigger]?.condition || "";
};
