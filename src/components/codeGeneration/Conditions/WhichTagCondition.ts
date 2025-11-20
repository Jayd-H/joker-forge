import { TAG_TYPES } from "../../data/BalatroUtils";
import type { Rule } from "../../ruleBuilder/types";
import { generateOperationCode } from "../lib/operationUtils";

export const generateWhichTagConditionCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params.operator.value as string) || "equals";
  const value = condition.params?.value.value as string || "double";
  const tag = TAG_TYPES[value];

  return generateOperationCode(
    operator,
    `context.tag_added.key`,
    `"${tag}"`,
  )
}