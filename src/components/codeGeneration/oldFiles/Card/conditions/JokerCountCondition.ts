import type { Rule } from "../../../ruleBuilder/types";
import { generateGameVariableCode } from "../../Jokers/gameVariableUtils";
import { getAllRarities, getModPrefix } from "../../../data/BalatroUtils";

export const generateJokerCountConditionCode = (rules: Rule[]): string => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "joker_count") return "";

  const operator = (condition.params?.operator as string) || "equals";
  const rarity = (condition.params?.rarity as string) || "any";
  const value = generateGameVariableCode(condition.params?.value);

  let comparison = "";
  switch (operator) {
    case "equals":
      comparison = `== ${value}`;
      break;
    case "not_equals":
      comparison = `~= ${value}`;
      break;
    case "greater_than":
      comparison = `> ${value}`;
      break;
    case "less_than":
      comparison = `< ${value}`;
      break;
    case "greater_equals":
      comparison = `>= ${value}`;
      break;
    case "less_equals":
      comparison = `<= ${value}`;
      break;
    default:
      comparison = `== ${value}`;
  }

  if (rarity === "any") {
    return `#G.jokers.cards ${comparison}`;
  }

  const rarityData = getAllRarities().find((r) => r.key === rarity);
  const modPrefix = getModPrefix();
  const rarityValue = rarityData?.isCustom
    ? `"${modPrefix}_${rarity}"`
    : rarityData?.value;

  return `(function()
    local count = 0
    for _, joker_owned in pairs(G.jokers.cards or {}) do
        if joker_owned.config.center.rarity == ${rarityValue} then
            count = count + 1
        end
    end
    return count ${comparison}
end)()`;
};
