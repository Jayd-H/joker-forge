import type { Rule } from "../../../ruleBuilder/types";

export const generateConsumableTypeConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const triggerType = rules[0].trigger || "consumable_used";
  const consumableType = (condition.params.consumable_type as string) || "any";
  const specificCard = (condition.params.specific_card as string) || "any";

  // Determine the card reference based on trigger type
  const cardRef =
    triggerType === "card_bought" ? "context.card" : "context.consumeable";

  if (consumableType === "any") {
    return `${cardRef} and (${cardRef}.ability.set == 'Tarot' or ${cardRef}.ability.set == 'Planet' or ${cardRef}.ability.set == 'Spectral')`;
  }

  // Handle vanilla sets
  if (consumableType === "Tarot") {
    if (specificCard === "any") {
      return `${cardRef} and ${cardRef}.ability.set == 'Tarot'`;
    } else {
      const normalizedCardKey = specificCard.startsWith("c_")
        ? specificCard
        : `c_${specificCard}`;

      return `${cardRef} and ${cardRef}.ability.set == 'Tarot' and ${cardRef}.config.center.key == '${normalizedCardKey}'`;
    }
  }

  if (consumableType === "Planet") {
    if (specificCard === "any") {
      return `${cardRef} and ${cardRef}.ability.set == 'Planet'`;
    } else {
      const normalizedCardKey = specificCard.startsWith("c_")
        ? specificCard
        : `c_${specificCard}`;

      return `${cardRef} and ${cardRef}.ability.set == 'Planet' and ${cardRef}.config.center.key == '${normalizedCardKey}'`;
    }
  }

  if (consumableType === "Spectral") {
    if (specificCard === "any") {
      return `${cardRef} and ${cardRef}.ability.set == 'Spectral'`;
    } else {
      const normalizedCardKey = specificCard.startsWith("c_")
        ? specificCard
        : `c_${specificCard}`;

      return `${cardRef} and ${cardRef}.ability.set == 'Spectral' and ${cardRef}.config.center.key == '${normalizedCardKey}'`;
    }
  }

  // Handle custom consumable sets
  const setKey = consumableType.includes("_")
    ? consumableType.split("_").slice(1).join("_")
    : consumableType;

  if (specificCard === "any") {
    return `${cardRef} and (${cardRef}.ability.set == '${setKey}' or ${cardRef}.ability.set == '${consumableType}')`;
  } else {
    const normalizedCardKey = specificCard.startsWith("c_")
      ? specificCard
      : `c_${specificCard}`;

    return `${cardRef} and (${cardRef}.ability.set == '${setKey}' or ${cardRef}.ability.set == '${consumableType}') and ${cardRef}.config.center.key == '${normalizedCardKey}'`;
  }
};
