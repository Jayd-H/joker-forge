import { getAllRarities, getModPrefix} from "../../../data/BalatroUtils";
import type { Rule } from "../../../ruleBuilder/types";

export const generateJokerRarityConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const rarity = (condition.params.rarity as string) || "any";

  const rarityData = getAllRarities().find((r) => r.key === rarity);
  const modPrefix = getModPrefix();
  const rarityValue = rarityData?.isCustom ? `"${modPrefix}_${rarity}"`: rarityData?.value;

  return `(function()
    return context.other_joker.config.center.rarity == ${rarityValue}
end)()`
};
