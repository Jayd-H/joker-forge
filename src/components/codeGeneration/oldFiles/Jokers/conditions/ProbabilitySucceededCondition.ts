import type { Rule } from "../../../ruleBuilder/types";

export const generateProbabilitySucceededConditionCode = (
  rules: Rule[]
): string => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const status = (condition.params.status as string) || "succeeded";

  return `${status === "succeeded" ? "" : "not "}context.result`;
};
