import type { Rule } from "../../../ruleBuilder/types";

export const generateSystemConditionCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];

  return `love.system.getOS() == "${condition.params?.system || "Windows"}"`;
};
