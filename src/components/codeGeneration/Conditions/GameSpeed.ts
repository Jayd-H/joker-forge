import type { Rule } from "../../ruleBuilder/types";
import { generateOperationCode } from "../lib/operationUtils";

export const generateGameSpeedConditionCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operation = condition.params?.operation?.value as string || "equals"
  const valueCode = condition.params?.speed?.value as string || "1"

  return generateOperationCode(
    operation, 
    `G.SETTINGS.GAMESPEED`, 
    valueCode
  );
}