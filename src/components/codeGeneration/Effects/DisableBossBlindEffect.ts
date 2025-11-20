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
                card_eval_status_text(${itemType === "joker" ? 'context.blueprint_card or ' : ''}card, 'extra', nil, nil, nil, {message = ${
                  customMessage
                    ? `"${customMessage}"`
                    : `localize('ph_boss_disabled')`
                }, colour = G.C.GREEN})
            end`;

  if (isScoring || itemType === 'consumable') {
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