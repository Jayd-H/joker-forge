import type { Rule } from "../../../ruleBuilder/types";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateConsumableCountConditionCode = (rules: Rule[]): string => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "consumable_count") return "";

  const consumableType = (condition.params.consumable_type as string) || "any";
  const specificCard = (condition.params.specific_card as string) || "any";
  const operator = (condition.params.operator as string) || "equals";
  const value = generateGameVariableCode(condition.params.value);

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

  if (consumableType === "any") {
    return `#G.consumeables.cards ${comparison}`;
  }

  // Handle vanilla sets
  if (
    consumableType === "Tarot" ||
    consumableType === "Planet" ||
    consumableType === "Spectral"
  ) {
    if (specificCard === "any") {
      return `(function()
    local count = 0
    for _, consumable_card in pairs(G.consumeables.cards or {}) do
        if consumable_card.ability.set == '${consumableType}' then
            count = count + 1
        end
    end
    return count ${comparison}
end)()`;
    } else {
      const normalizedCardKey = specificCard.startsWith("c_")
        ? specificCard
        : `c_${specificCard}`;

      return `(function()
    local count = 0
    for _, consumable_card in pairs(G.consumeables.cards or {}) do
        if consumable_card.config.center.key == "${normalizedCardKey}" then
            count = count + 1
        end
    end
    return count ${comparison}
end)()`;
    }
  }

  // Handle custom consumable sets
  const setKey = consumableType.includes("_")
    ? consumableType.split("_").slice(1).join("_")
    : consumableType;

  if (specificCard === "any") {
    return `(function()
    local count = 0
    for _, consumable_card in pairs(G.consumeables.cards or {}) do
        if consumable_card.ability.set == '${setKey}' or consumable_card.ability.set == '${consumableType}' then
            count = count + 1
        end
    end
    return count ${comparison}
end)()`;
  } else {
    const normalizedCardKey = specificCard.startsWith("c_")
      ? specificCard
      : `c_${specificCard}`;

    return `(function()
    local count = 0
    for _, consumable_card in pairs(G.consumeables.cards or {}) do
        if consumable_card.config.center.key == "${normalizedCardKey}" then
            count = count + 1
        end
    end
    return count ${comparison}
end)()`;
  }
};
