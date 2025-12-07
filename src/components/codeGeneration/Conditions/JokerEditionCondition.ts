import type { Rule } from "../../ruleBuilder/types";

export const generateJokerEditionConditionCode = (
  rules: Rule[],
  itemType: string,
  target: string,
):string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const edition = (condition.params?.edition.value as string) || "foil";
  let valueCode = ''

  switch(itemType) {
    case "joker":
      valueCode = (target === "self" ? "card" : "context.other_joker")
      break
    case "consumable":
      valueCode = "G.jokers.highlighted[1]"
      break
  }

  return `(function()
    return ${valueCode}.ability.${edition}
end)()`
}