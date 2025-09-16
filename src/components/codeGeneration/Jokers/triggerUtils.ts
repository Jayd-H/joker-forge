import type { Rule } from "../../ruleBuilder/types";
import type { RuleAttributes } from "./RuleUtils";


interface TriggerContext {
  check: string;
  comment: string;
}

export const generateTriggerContext = (
  triggerType: string,
  rules: Rule[],
  currentRule: RuleAttributes
): TriggerContext => {
  const hasRetriggerEffects = rules.some((rule) =>
    rule.effects.some((effect) => effect.type === "retrigger_cards")
  );

  const isBlueprintCompatible = currentRule.blueprintCompatible ?? true;

  switch (triggerType) {
    case "card_scored":
      if (hasRetriggerEffects) {
        return {
          check: `context.repetition and context.cardarea == G.play ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
          comment: "-- Card repetition context for retriggering",
        };
      } else {
        return {
          check:
            `context.individual and context.cardarea == G.play ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
          comment: "-- Individual card scoring",
        };
      }

    case "card_held_in_hand":
      if (hasRetriggerEffects) {
        return {
          check:
            `context.repetition and context.cardarea == G.hand and (next(context.card_effects[1]) or #context.card_effects > 1) ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
          comment: "-- Card repetition context for held cards",
        };
      } else {
        return {
          check:
            `context.individual and context.cardarea == G.hand and not context.end_of_round ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
          comment: "-- Individual card held in hand",
        };
      }

    case "blind_selected":
      return {
        check: `context.setting_blind ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- When blind is selected",
      };

    case "blind_skipped":
      return {
        check: `context.skip_blind ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- When blind is skipped",
      };

    case "boss_defeated":
      return {
        check:
          `context.end_of_round and context.main_eval and G.GAME.blind.boss ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- After boss blind is defeated",
      };

    case "tag_added":
      return {
        check:
          `context.tag_added ${isBlueprintCompatible ? '' : 'and not context.blueprint'}`,
        comment: "-- When you obtain a Tag",
      };

    case "booster_opened":
      return {
        check: `context.open_booster ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- When booster pack is opened",
      };

    case "booster_skipped":
      return {
        check: `context.skipping_booster ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- When booster pack is skipped",
      };

    case "consumable_used":
      return {
        check: `context.using_consumeable ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- When consumable is used",
      };

    case "hand_drawn":
      return {
        check: `context.hand_drawn ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- When hand is drawn",
      };

    case "first_hand_drawn":
      return {
        check: `context.first_hand_drawn ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- When first hand is drawn",
      };

    case "shop_entered":
      return {
        check: `context.starting_shop ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- When entering shop",
      };

    case "shop_exited":
      return {
        check: `context.ending_shop ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- When exiting shop",
      };

    case "shop_reroll":
      return {
        check: `context.reroll_shop ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- When shop is rerolled",
      };

    case "round_end":
      return {
        check:
          `context.end_of_round and context.game_over == false and context.main_eval ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- At the end of the round",
      };

    case "card_discarded":
      return {
        check: `context.discard ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- When card is discarded",
      };

    case "hand_discarded":
      return {
        check: `context.pre_discard ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- When hand is discarded",
      };

    case "before_hand_played":
      return {
        check: `context.before and context.cardarea == G.jokers ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- Before hand starts scoring",
      };

    case "after_hand_played":
      return {
        check: `context.after and context.cardarea == G.jokers ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- After hand has finished scoring",
      };

    case "card_sold":
      return {
        check: `context.selling_card ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- When any card is sold",
      };

    case "card_bought":
      return {
        check: `context.buying_card ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- When any card is bought",
      };

    case "selling_self":
      return {
        check: `context.selling_self ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- When this specific joker is sold",
      };

    case "buying_self":
      return {
        check: `context.buying_card and context.card.config.center.key == self.key and context.cardarea == G.jokers ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- When this specific joker is bought",
      };

    case "joker_evaluated":
      return {
        check: `context.other_joker ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- When another joker is triggered",
      };

    case "game_over":
      return {
        check:
          `context.end_of_round and context.game_over and context.main_eval ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- When the game would end (game over)",
      };

    case "card_held_in_hand_end_of_round":
      if (hasRetriggerEffects) {
        return {
          check:
            `context.repetition and context.cardarea == G.hand and context.end_of_round and (next(context.card_effects[1]) or #context.card_effects > 1) ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
          comment: "-- Card repetition context for held cards at end of round",
        };
      } else {
        return {
          check:
            `context.cardarea == G.hand and context.end_of_round ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
          comment: "-- When a card hand is held at the end of the round",
        };
      }

    case "card_destroyed":
      return {
        check: `context.remove_playing_cards ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- When cards are destroyed",
      };

    case "playing_card_added":
      return {
        check: `context.playing_card_added ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- When playing cards are added to deck",
      };

    case "probability_result":
      return {
        check: `context.pseudorandom_result ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- When chance roll succeeds/failes",
      };
    case "played_cards_before_scoring":
      return {
        check: `context.before${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- Evaluates each Card before scoring begins",
      };
    case "hand_played":
    default:
      return {
        check: `context.cardarea == G.jokers and context.joker_main ${isBlueprintCompatible ? '' : ' and not context.blueprint'}`,
        comment: "-- Main scoring time for jokers",
      };
  }
};
