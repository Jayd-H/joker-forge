import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn, PassiveEffectResult } from "../lib/effectUtils";

export const generateDisableBossBlindPassiveEffectCode = (
  effect: Effect,
): PassiveEffectResult => {
  const customMessage = effect.customMessage;

  const addToDeck = `
  if G.GAME.blind and G.GAME.blind.boss and not G.GAME.blind.disabled then
      G.GAME.blind:disable()
      play_sound('timpani')
      SMODS.calculate_effect({ message = ${
        customMessage ? `"${customMessage}"` : `localize('ph_boss_disabled')`
      } }, card)
  end
  `; 
  const calculateFunction = `
    if G.GAME.blind and G.GAME.blind.boss and not G.GAME.blind.disabled then
        G.GAME.blind:disable()
        play_sound('timpani')
        SMODS.calculate_effect({ message = ${
          customMessage ? `"${customMessage}"` : `localize('ph_boss_disabled')`
        } }, card)
    end`;

  return {
    addToDeck,
    calculateFunction,
    configVariables: [],
    locVars: [],
  };
};

export const generateDisableBossBlindEffectCode = (
  effect: Effect,
  itemType: string,
  triggerType: string,
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect, triggerType)
    case "consumable":
      return generateConsumableCode(effect)

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