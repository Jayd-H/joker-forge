import type { Effect } from "../../../ruleBuilder/types";

export interface ConsideredAsResult {
  calculateFunction: string;
  configVariables: string[];
  locVars: string[];
}

export const generatePassiveConsideredAs = (
  effect: Effect
): ConsideredAsResult => {
  const sourceType = (effect.params?.source_type as string) || "enhancement";
  const sourceValue = (effect.params?.source_value as string) || "m_gold";
  const targetType = (effect.params?.target_type as string) || "enhancement";
  const targetValue = (effect.params?.target_value as string) || "m_steel";

  const generateSourceCheck = (): string => {
    switch (sourceType) {
      case "rank": {
        const rankId =
          sourceValue === "A"
            ? "14"
            : sourceValue === "K"
            ? "13"
            : sourceValue === "Q"
            ? "12"
            : sourceValue === "J"
            ? "11"
            : sourceValue;
        return `context.other_card:get_id() == ${rankId}`;
      }

      case "suit":
        if (sourceValue === "red") {
          return `(context.other_card:is_suit("Hearts") or context.other_card:is_suit("Diamonds"))`;
        } else if (sourceValue === "black") {
          return `(context.other_card:is_suit("Spades") or context.other_card:is_suit("Clubs"))`;
        } else {
          return `context.other_card:is_suit("${sourceValue}")`;
        }

      case "enhancement":
        return `context.other_card.config.center.key == "${sourceValue}"`;

      case "seal":
        if (sourceValue === "any") {
          return `context.other_card.seal ~= nil`;
        } else if (sourceValue === "none") {
          return `context.other_card.seal == nil`;
        } else {
          return `context.other_card.seal == "${sourceValue}"`;
        }

      case "edition":
        if (sourceValue === "any") {
          return `context.other_card.edition ~= nil`;
        } else if (sourceValue === "none") {
          return `context.other_card.edition == nil`;
        } else {
          return `context.other_card.edition and context.other_card.edition.key == "${sourceValue}"`;
        }

      default:
        return "false";
    }
  };

  // Generate the return value based on target type
  const generateTargetReturn = (): string => {
    switch (targetType) {
      case "enhancement":
        return `${targetValue} = true`;

      case "seal":
        // For seals  need to temporarily mark cards and handle in a different context
        // This is a simplified approach full implementation would be more complex
        return `-- Seal: ${targetValue} = true`;

      case "edition":
        // For editions, similar approach needed
        return `-- Edition: ${targetValue} = true`;

      default:
        return `${targetValue} = true`;
    }
  };

  const sourceCheck = generateSourceCheck();
  const targetReturn = generateTargetReturn();

  // Generate the calculate function
  // May need to be changed later because of the passive rework. (what i mean is removing the `calculate = function(self, card, context)`)
  const calculateFunction = `calculate = function(self, card, context)
        if context.check_enhancement then
            if ${sourceCheck} then
                return {
                    ${targetReturn}
                }
            end
        end
    end`;

  return {
    calculateFunction,
    configVariables: [
      `source_type = "${sourceType}"`,
      `source_value = "${sourceValue}"`,
      `target_type = "${targetType}"`,
      `target_value = "${targetValue}"`,
    ],
    locVars: [
      `card.ability.extra.source_type`,
      `card.ability.extra.source_value`,
      `card.ability.extra.target_type`,
      `card.ability.extra.target_value`,
    ],
  };
};
