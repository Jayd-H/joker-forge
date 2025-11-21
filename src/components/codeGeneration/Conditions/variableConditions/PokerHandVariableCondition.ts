import type { Rule } from "../../../ruleBuilder/types";

export const generatePokerHandVariableConditionCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const variableName = (condition.params?.variable_name?.value as string) || "pokerhandvar";
  const CheckType = (condition.params?.check_type?.value as string) || "specific";

switch (CheckType) {
    case "specific":
      return `G.GAME.current_round.${variableName}_hand == "${condition.params?.specific_pokerhand || "High Card"}"`;
    case "most_played":
      return `G.GAME.current_round.${variableName}_hand == G.GAME.hands.visible and G.GAME.hands.played > ${variableName}_tally`;
    case "least_played":
      return `G.GAME.current_round.${variableName}_hand == G.GAME.hands.visible and G.GAME.hands.played < ${variableName}_tally`;
    default:
      return `G.GAME.current_round.${variableName}_hand == "${condition.params?.specific_pokerhand || "High Card"}"`;
  }
};
