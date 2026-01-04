import type { Rule } from "../../ruleBuilder/types";

export const generateJokerSelectedConditionCode = (
  rules: Rule[],
): string | null => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "joker_selected") return "";

  const check_key = condition.params?.check_key?.value;
  const joker_key = condition.params?.joker_key?.value as string;
  const rarity = condition.params?.rarity?.value as string;
  
  if (check_key == "any") {
    if (rarity == "any") {
      return "#G.jokers.highlighted > 0";
    }
    let rarityKey: string
    switch (rarity) {
      case "common": rarityKey = "Common"; break;
      case "uncommon": rarityKey = "Uncommon"; break;
      case "rare": rarityKey = "Rare"; break;
      case "legendary": rarityKey = "Legendary"; break;
      default: rarityKey = rarity
    }
    return `#G.jokers.highlighted > 0 and G.jokers.highlighted[1]:is_rarity("${rarityKey}")`;
  } else if (check_key == "key") {
    const j_key = joker_key.startsWith("j_") ? joker_key : `j_${joker_key}`
    return `#G.jokers.highlighted > 0 and G.jokers.highlighted[1].config.center.key == "${j_key}"`;
  }
  
  return "( The generateJokerSelectedConditionCode received invalid parameters )"
}