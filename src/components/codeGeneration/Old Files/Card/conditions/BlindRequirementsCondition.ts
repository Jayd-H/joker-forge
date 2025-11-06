import type { Rule } from "../../../ruleBuilder/types";
import { generateGameVariableCode } from "../../Jokers/gameVariableUtils";

export const generateBlindRequirementsConditionCode = (
  rules: Rule[]
): string => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "blind_requirements") return "";

  const operator = (condition.params?.operator as string) || "greater_equals";
  const percentageValue =
    generateGameVariableCode(condition.params?.percentage) || 25;

  const decimal = Number(percentageValue) / 100;

  let comparison = "";
  switch (operator) {
    case "equals":
      comparison = `== to_big(${decimal})`;
      break;
    case "not_equals":
      comparison = `~= to_big(${decimal})`;
      break;
    case "greater_than":
      comparison = `> to_big(${decimal})`;
      break;
    case "less_than":
      comparison = `< to_big(${decimal})`;
      break;
    case "greater_equals":
      comparison = `>= to_big(${decimal})`;
      break;
    case "less_equals":
      comparison = `<= to_big(${decimal})`;
      break;
    default:
      comparison = `>= to_big(${decimal})`;
  }

  return `G.GAME.chips / G.GAME.blind.chips ${comparison}`;
};
