import type { Rule } from "../../../ruleBuilder/types";
import { generateObjectContextCode } from "../../lib/codeGenUtils";

export const generateKeyVariableConditionCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const variableName = (condition.params.variable_name as string) || "keyvar";
  const checkType = (condition.params.check_type as string) || "custom_text";

  const valueCode = generateObjectContextCode(checkType)

  if (checkType === 'custom_text') {
    return `card.ability.extra.${variableName} == "${condition.params?.specific_key || "none"}"`;
  } else {
    return `card.ability.extra.${variableName} == ${valueCode}`;
  }
}
