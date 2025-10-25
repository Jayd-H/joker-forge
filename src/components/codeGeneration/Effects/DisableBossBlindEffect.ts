import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import type { ConsumableData, EditionData, EnhancementData, JokerData, SealData } from "../../data/BalatroUtils";

export const generateDisableBossBlindReturn = (
  effect: Effect,
  itemType: string,
  triggerType: string,
  joker?: JokerData,
  consumable?: ConsumableData,
  card?: EnhancementData | EditionData | SealData,
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect, triggerType, joker)
    case "consumable":
      return generateConsumableCode(effect, consumable)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateJokerCode = (
  effect: Effect,
  triggerType: string,
  joker?: JokerData
): EffectReturn => {
const customMessage = effect.customMessage;

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  const disableCode = `
            if G.GAME.blind and G.GAME.blind.boss and not G.GAME.blind.disabled then
                G.E_MANAGER:add_event(Event({
                    func = function()
                        G.GAME.blind:disable()
                        play_sound('timpani')
                        return true
                    end
                }))
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${
                  customMessage
                    ? `"${customMessage}"`
                    : `localize('ph_boss_disabled')`
                }, colour = G.C.GREEN})
            end`;

  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__${disableCode}
                __PRE_RETURN_CODE_END__`,
      colour: "G.C.GREEN",
    };
  } else {
    return {
      statement: `func = function()${disableCode}
                    return true
                end`,
      colour: "G.C.GREEN",
    };
  }
};

const generateConsumableCode = (
  effect: Effect,
  consumable?: ConsumableData
): EffectReturn => {
  const customMessage = effect.customMessage;

  const disableCode = `
            if G.GAME.blind and G.GAME.blind.boss and not G.GAME.blind.disabled then
                G.E_MANAGER:add_event(Event({
                    func = function()
                        G.GAME.blind:disable()
                        play_sound('timpani')
                        return true
                    end
                }))
                card_eval_status_text(card, 'extra', nil, nil, nil, {message = ${
                  customMessage
                    ? `"${customMessage}"`
                    : `localize('ph_boss_disabled')`
                }, colour = G.C.GREEN})
            end`;

  const result: EffectReturn = {
    statement: disableCode,
    colour: "G.C.SECONDARY_SET.Tarot",
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};