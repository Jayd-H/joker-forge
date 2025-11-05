import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../Consumables/gameVariableUtils";

export const generateJokerSelectedConditionCode = (
  rules: Rule[],
): string | null => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "joker_selected") return "";

 const operator = condition.params?.operator || "greater_than";
  const value = condition.params?.value || 1;

  const valueCode = generateGameVariableCode(value);

  switch (operator) {
    case "greater_than":
      return `#G.jokers.highlighted > ${valueCode}`;
    case "greater_equals":
      return `#G.jokers.highlighted >= ${valueCode}`;
    case "less_than":
      return `#G.jokers.highlighted < ${valueCode}`;
    case "less_equals":
      return `#G.jokers.highlighted <= ${valueCode}`;
    case "equals":
      return `#G.jokers.highlighted == ${valueCode}`;
    case "not_equal":
      return `#G.jokers.highlighted ~= ${valueCode}`;
    default:
      return `#G.jokers.highlighted > ${valueCode}`;
 }
}