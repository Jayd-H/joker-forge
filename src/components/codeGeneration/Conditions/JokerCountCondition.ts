import type { Rule } from "../../ruleBuilder/types";
import { getAllRarities, getModPrefix } from "../../data/BalatroUtils";
import { generateValueCode } from "../lib/gameVariableUtils";
import { generateOperationCode } from "../lib/operationUtils";

export const generateJokerCountConditionCode = (
  rules: Rule[],
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params?.operator?.value as string) || "equals";
  const rarity = (condition.params?.rarity?.value as string) || "any";
  const value = generateValueCode(condition.params?.value, '');
 
  const comparison = generateOperationCode(
    operator,
    'count',
    value,
  )
 
  if (rarity === "any") {
    return generateOperationCode(
      operator,
      '#G.jokers.cards',
      value,
  )}

  const rarityData = getAllRarities().find((r) => r.key === rarity);
  const modPrefix = getModPrefix();
  const rarityValue = rarityData?.isCustom ? `"${modPrefix}_${rarity}"`: rarityData?.value;

  return `(function()
    local count = 0
    for _, joker_owned in pairs(G.jokers.cards or {}) do
        if joker_owned.config.center.rarity == ${rarityValue} then
            count = count + 1
        end
    end
    return ${comparison}
end)()`
};