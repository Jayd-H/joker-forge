import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateChangePokerHandVariableReturn = (
  effect: Effect
): EffectReturn => {
  const variableName =
    (effect.params.variable_name as string) || "pokerhandvar";
  const changeType = (effect.params.change_type as string) || "random";
  const specificPokerHand =
    (effect.params.specific_pokerhand as string) || "High Card";

  let statement = "";

  if (changeType === "random") {
    statement = `__PRE_RETURN_CODE__
                local ${variableName}_hands = {}
                for handname, _ in pairs(G.GAME.hands) do
                    if G.GAME.hands[handname].visible then
                        ${variableName}_hands[#${variableName}_hands + 1] = handname
                    end
                end
                if ${variableName}_hands[1] then
                    G.GAME.current_round.${variableName}_hand = pseudorandom_element(${variableName}_hands, pseudoseed('${variableName}' .. G.GAME.round_resets.ante))
                end
                __PRE_RETURN_CODE_END__`;
  } else if (changeType === "most_played") {
    statement = `__PRE_RETURN_CODE__
                local ${variableName}_hand, ${variableName}_tally = nil, 0
                for k, v in ipairs(G.handlist) do
                    if G.GAME.hands[v].visible and G.GAME.hands[v].played > ${variableName}_tally then
                        ${variableName}_hand = v
                        ${variableName}_tally = G.GAME.hands[v].played
                    end
                end
                if ${variableName}_hand then
                    G.GAME.current_round.${variableName}_hand = ${variableName}_hand
                end
                __PRE_RETURN_CODE_END__`;
  } else if (changeType === "least_played") {
    statement = `__PRE_RETURN_CODE__
                local ${variableName}_hand, ${variableName}_tally = nil, math.huge
                for k, v in ipairs(G.handlist) do
                    if G.GAME.hands[v].visible and G.GAME.hands[v].played < ${variableName}_tally then
                        ${variableName}_hand = v
                        ${variableName}_tally = G.GAME.hands[v].played
                    end
                end
                if ${variableName}_hand then
                    G.GAME.current_round.${variableName}_hand = ${variableName}_hand
                end
                __PRE_RETURN_CODE_END__`;
  } else {
    statement = `__PRE_RETURN_CODE__
                G.GAME.current_round.${variableName}_hand = '${specificPokerHand}'
                __PRE_RETURN_CODE_END__`;
  }

  const result: EffectReturn = {
    statement,
    colour: "G.C.FILTER",
  };

  if (effect.customMessage) {
    result.message = effect.customMessage;
  }

  return result;
};
