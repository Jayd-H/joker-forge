import type { Rule } from "../../ruleBuilder/types";
import type { JokerData } from "../../data/BalatroUtils";
import { parseSuitVariable } from "../lib/userVariableUtils";

export const generateCardSuitConditionCode = (
  rules: Rule[],
  itemType: string,
  joker?: JokerData,
):string | null => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(rules, joker)
    case "card":
      return generateCardCode(rules, )
  }
  return null
}

const generateJokerCode = (
  rules: Rule[],
  joker?: JokerData
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const triggerType = rules[0].trigger || "hand_played";
  const suitType = (condition.params?.suit_type?.value as string) || "specific";
  const specificSuit = (condition.params?.specific_suit?.value);
  const suitGroup = (condition.params?.suit_group?.value as string) || null;

  const suitVarInfo = parseSuitVariable(specificSuit, joker);

  const getSuitsCheckLogic = (
    suits: string[],
    useVariable = false,
    varCode?: string,
    cardRef = "c"
  ): string => {
    if (useVariable && varCode) {
      return `${cardRef}:is_suit(${varCode})`;
    } else if (suits.length === 1) {
      return `${cardRef}:is_suit("${suits[0]}")`;
    } else {
      return suits.map((suit) => `${cardRef}:is_suit("${suit}")`).join(" or ");
    }
  };

  let suits: string[] = [];
  let useVariable = false;
  let variableCode = "";

  if (suitType === "specific") {
    if (suitVarInfo.isSuitVariable) {
      useVariable = true;
      variableCode = suitVarInfo.code!;
    } else if (typeof specificSuit === "string") {
      suits = [specificSuit];
    }
  } else if (suitType === "group" && suitGroup) {
    if (suitGroup === "red") {
      suits = ["Hearts", "Diamonds"];
    } else if (suitGroup === "black") {
      suits = ["Spades", "Clubs"];
    }
  }

  if (triggerType === "card_destroyed") {
    const checkLogic = getSuitsCheckLogic(
      suits,
      useVariable,
      variableCode,
      "removed_card"
    );
    return `(function()
    for k, removed_card in ipairs(context.removed) do
        if ${checkLogic} then
            return true
        end
    end
    return false
end)()`;
  }

  const checkLogic = getSuitsCheckLogic(
    suits,
    useVariable,
    variableCode,
    "context.other_card"
  );
  return checkLogic;
}

const generateCardCode = (
  rules: Rule[],
): string | null => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "card_suit") return "";

  const suitType = (condition.params?.suit_type.value as string) || "specific";
  const specificSuit = (condition.params?.specific_suit.value as string);
  const suitGroup = (condition.params?.suit_group.value as string);

  if (suitType === "specific" && specificSuit) {
    return `card:is_suit("${specificSuit}")`;
  } else if (suitType === "group" && suitGroup) {
    switch (suitGroup) {
      case "red":
        return `(card:is_suit("Hearts") or card:is_suit("Diamonds"))`;
      case "black":
        return `(card:is_suit("Spades") or card:is_suit("Clubs"))`;
      default:
        return "";
    }
  }

  return "";
}