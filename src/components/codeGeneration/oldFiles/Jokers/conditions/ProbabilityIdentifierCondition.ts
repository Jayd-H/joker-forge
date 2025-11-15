import type { Rule } from "../../../ruleBuilder/types";

export const generateProbabilityIdentifierConditionCode = (rules: Rule[]): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const mode = condition.params.mode || "vanilla";

  let specific_card: string;
  switch (mode) {
    case "custom":
      specific_card = (condition.params.card_key as string) || "j_joker";
      break;
    case "vanilla":
    default:
      specific_card = (condition.params.specific_card as string) || "8ball"
  }

  return `context.identifier == "${specific_card}"`;
};
