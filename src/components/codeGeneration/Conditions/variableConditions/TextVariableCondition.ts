import type { Rule } from "../../../ruleBuilder/types";

export const generateTextVariableConditionCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const variableName = (condition.params.variable_name as string) || "textvar";
  const CheckType = (condition.params.check_type as string) || "custom_text";
  const customText = (condition.params?.text as string) || "";
  const keyVar = (condition.params?.key_variable as string) || "keyvar"

switch (CheckType) {
    case "custom_text":
      return `card.ability.extra.${variableName} == '${customText}'`;
    case "key_var":
      return `card.ability.extra.${variableName} == card.ability.extra.${keyVar}`;
    default:
      return `card.ability.extra.${variableName} == '${customText}'`;
  }
};
