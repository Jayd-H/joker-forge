import type { Effect } from "../../../ruleBuilder/types";
import { getRankId } from "../../../data/BalatroUtils";
import { EffectReturn } from "../effectUtils";

export const generateChangeRankVariableReturn = (
  effect: Effect
): EffectReturn => {
  const variableName = (effect.params.variable_name as string) || "rankvar";
  const changeType = (effect.params.change_type as string) || "random";
  const specificRank = (effect.params.specific_rank as string) || "A";
  const rankPoolActive = (effect.params.rank_pool as Array<boolean>) || [];
  const rankPoolRanks = [
    "'A'","'2'","'3'","'4'","'5'",
    "'6'","'7'","'8'","'9'","'10'",
    "'J'","'Q'","'K'"
  ]

  let statement = "";

  if (changeType === "random") {
    statement = `__PRE_RETURN_CODE__
                    if G.playing_cards then
                        local valid_${variableName}_cards = {}
                        for _, v in ipairs(G.playing_cards) do
                            if not SMODS.has_no_rank(v) then
                                valid_${variableName}_cards[#valid_${variableName}_cards + 1] = v
                            end
                        end
                        if valid_${variableName}_cards[1] then
                            local ${variableName}_card = pseudorandom_element(valid_${variableName}_cards, pseudoseed('${variableName}' .. G.GAME.round_resets.ante))
                            G.GAME.current_round.${variableName}_card.rank = ${variableName}_card.base.value
                            G.GAME.current_round.${variableName}_card.id = ${variableName}_card.base.id
                        end
                    end
                    __PRE_RETURN_CODE_END__`;
  } else if (changeType === "pool") {
    const rank_pool = []
    for (let i = 0; i < rankPoolActive.length; i++){
      if (rankPoolActive[i] == true){
      rank_pool.push(rankPoolRanks[i])
    }}
    statement = `__PRE_RETURN_CODE__
                local rank_pool = {${rank_pool}}
                G.GAME.current_round.${variableName}_card.suit = pseudorandom_element(rank_pool, pseudoseed('randomRank'))
                __PRE_RETURN_CODE_END__`;
  } else {
    const rankId = getRankId(specificRank);
    statement = `__PRE_RETURN_CODE__
                    G.GAME.current_round.${variableName}_card.rank = '${specificRank}'
                    G.GAME.current_round.${variableName}_card.id = ${rankId}
                    __PRE_RETURN_CODE_END__`;
  }

  const result: EffectReturn = {
    statement,
    colour: "G.C.FILTER",
  };

  if (effect.customMessage) {
    result.message = `"${effect.customMessage}"`;
  }

  return result;
};
