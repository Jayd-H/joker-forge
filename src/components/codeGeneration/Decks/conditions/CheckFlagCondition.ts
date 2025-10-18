import { getModPrefix } from "../../../data/BalatroUtils";
import type { Rule } from "../../../ruleBuilder/types";

export const generateCheckFlagConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const flagName = (condition.params.flag_name as string) || "custom_flag";

  const safeFlagName = flagName.trim().replace(/[^a-zA-Z0-9_]/g, '_'); // replace non-alphanumeric charactes with underscore

  const modPrefix = getModPrefix()

  return `(G.GAME.pool_flags.${modPrefix}_${safeFlagName} or false)`;
};
