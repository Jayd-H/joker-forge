import { TAG_TYPES } from "../../../data/BalatroUtils";
import { Rule } from "../../../ruleBuilder/types";

export const generateWhichTagConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params.operator as string) || "equals";
  const value = condition.params?.value as string || "double";
  const tag = TAG_TYPES[value];

  let comparison = "";
  switch (operator) {
    case "equals":
      comparison = `== "${tag}"`;
      break;
    case "not_equals":
      comparison = `~= "${tag}"`;
      break;
    default:
      comparison = `== "${tag}"`;
  }

  return `context.tag_added.key ${comparison}`
}