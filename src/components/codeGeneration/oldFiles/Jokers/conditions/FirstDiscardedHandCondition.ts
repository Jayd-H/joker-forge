export const generateFirstDiscardedHandConditionCode = (): string => {
  return `G.GAME.current_round.discards_used <= 0`;
};
