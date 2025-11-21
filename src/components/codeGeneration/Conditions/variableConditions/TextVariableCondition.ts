import type { Rule } from "../../../ruleBuilder/types";

export const generateTextVariableConditionCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const variableName = (condition.params?.variable_name?.value as string) || "textvar";
  const CheckType = (condition.params?.check_type?.value as string) || "custom_text";
  const customText = (condition.params?.text?.value as string) || "";
  const keyVar = (condition.params?.key_variable?.value as string) || "keyvar"

switch (CheckType) {
    case "key_var":
      return `(function()
        local all_key_lists = {}
        for _, pool in pairs(G.P_CENTER_POOLS) do
            for _, item in pairs(pool) do
                table.insert(all_key_lists, item)
            end      
        end
        for _, current_card in pairs(all_key_lists) do
            if current_card.key == card.ability.extra.${keyVar} then
              if current_card.set == "Seal" then
                if card.ability.extra.${variableName} == current_card.key then
                  return true
                end
              else 
                if card.ability.extra.${variableName} = current_card.name then
                  return true
                end
              end
              break
            end
        end
        false
      end)()`;
    case "custom_text": 
    default:
      return `card.ability.extra.${variableName} == '${customText}'`;
  }
};
