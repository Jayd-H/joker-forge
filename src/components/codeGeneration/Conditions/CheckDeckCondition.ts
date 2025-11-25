import type { Rule } from "../../ruleBuilder/types";

export const generateCheckDeckConditionCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];

  return `G.GAME.selected_back.name == "${condition.params?.decks.value || "Red Deck"}"`;
};
