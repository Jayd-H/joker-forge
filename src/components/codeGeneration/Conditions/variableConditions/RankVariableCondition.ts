import type { Rule } from "../../../ruleBuilder/types";

export const generateRankVariableConditionCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const variableName = (condition.params?.variable_name?.value as string) || "rankvar";

  return `G.GAME.current_round.${variableName}_card.rank == "${condition.params?.specific_rank || "Ace"}" and G.GAME.current_round.${variableName}_card.id == "${condition.params?.specific_rank || "14"}"`;
};
