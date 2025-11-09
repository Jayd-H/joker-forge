export const generateFirstPlayedHandConditionCode = (): string => {
  return `G.GAME.current_round.hands_played == 0`;
};
