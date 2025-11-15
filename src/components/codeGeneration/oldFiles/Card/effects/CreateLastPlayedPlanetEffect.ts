import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateCreateLastPlayedPlanetReturn = (
  effect: Effect
): EffectReturn => {
  const isNegative = (effect.params?.is_negative as string) === "negative";
  const customMessage = effect.customMessage;

  const slotCheck = isNegative
    ? ""
    : "and #G.consumeables.cards + G.GAME.consumeable_buffer < G.consumeables.config.card_limit";
  const bufferCode = isNegative
    ? ""
    : "G.GAME.consumeable_buffer = G.GAME.consumeable_buffer + 1";
  const bufferReset = isNegative ? "" : "G.GAME.consumeable_buffer = 0";
  const negativeSetCode = isNegative
    ? `
                            planet_card:set_edition("e_negative", true)`
    : "";
  const messageText = customMessage
    ? `"${customMessage}"`
    : `localize('k_plus_planet')`;

  const planetCreationCode = `${bufferCode}
            G.E_MANAGER:add_event(Event({
                trigger = 'before',
                delay = 0.0,
                func = function()
                    if G.GAME.last_hand_played then
                        local _planet = nil
                        for k, v in pairs(G.P_CENTER_POOLS.Planet) do
                            if v.config.hand_type == G.GAME.last_hand_played then
                                _planet = v.key
                            end
                        end
                        if _planet then
                            local planet_card = SMODS.add_card({ key = _planet })${negativeSetCode}
                        end
                        ${bufferReset}
                    end
                    return true
                end
            }))`;

  return {
    statement: `__PRE_RETURN_CODE__${planetCreationCode}__PRE_RETURN_CODE_END__`,
    message: messageText,
    colour: "G.C.SECONDARY_SET.Planet",
    customCanUse: slotCheck ? slotCheck.replace("and ", "") : undefined,
  };
};
