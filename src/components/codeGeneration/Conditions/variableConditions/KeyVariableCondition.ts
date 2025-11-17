import type { Rule } from "../../../ruleBuilder/types";

export const generateKeyVariableConditionCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const variableName = (condition.params.variable_name as string) || "keyvar";
  const checkType = (condition.params.check_type as string) || "custom_text";

switch (checkType) {
    case "custom_text":
      return `card.ability.extra.${variableName} == "${condition.params?.specific_key || "none"}"`;
    case "key_variable":
      return `card.ability.extra.${variableName} == card.ability.extra.${condition.params?.key_variable || "keyvar"}`;
    default:
      return `card.ability.extra.${variableName} == "${condition.params?.specific_key || "none"}"`;
  }
};
