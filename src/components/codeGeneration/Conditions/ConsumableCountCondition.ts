import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../lib/gameVariableUtils";
import { generateOperationCode } from "../lib/operationUtils";

export const generateConsumableCountConditionCode = (
  rules: Rule[],
): string | null => {
   const condition = rules[0].conditionGroups[0].conditions[0];
   const consumableType = (condition.params?.consumable_type?.value as string) || "any";
   const specificCard = (condition.params?.specific_card?.value as string) || "any";
   const operator = (condition.params?.operator?.value as string) || "equals";
   const value = generateGameVariableCode(condition.params?.value, '');
 
   const comparison = generateOperationCode(
    operator,
    'count',
    value
   )
 
   if (consumableType === "any") {
     return generateOperationCode(
      operator,
      '#G.consumeables.cards',
      value
   )}
 
   // Handle vanilla sets
   if (consumableType === "Tarot" || consumableType === "Planet" || consumableType === "Spectral") {
     if (specificCard === "any") {
       return `(function()
     local count = 0
     for _, consumable_card in pairs(G.consumeables.cards or {}) do
         if consumable_card.ability.set == '${consumableType}' then
             count = count + 1
         end
     end
     return ${comparison}
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
     return ${comparison}
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
     return ${comparison}
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
     return ${comparison}
 end)()`;
   }
 };
 