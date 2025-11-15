import type { Rule } from "../../../ruleBuilder/types";

export const generateSuitVariableConditionCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const variableName = (condition.params.variable_name as string) || "suitvar";

  return `G.GAME.current_round.${variableName}_card.suit == "${condition.params?.specific_suit || "Spades"}"`;
};
