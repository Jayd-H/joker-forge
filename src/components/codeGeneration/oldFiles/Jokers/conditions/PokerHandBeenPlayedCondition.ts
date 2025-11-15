export const generatePokerHandBeenPlayedConditionCode = (): string | null => {
  return `G.GAME.hands[context.scoring_name] and G.GAME.hands[context.scoring_name].played_this_round > 1`;
};
