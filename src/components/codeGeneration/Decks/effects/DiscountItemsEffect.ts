import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateFreeRerollsReturn = (effect: Effect): EffectReturn => {
  const value = effect.params?.value || 1;

  const valueCode = generateGameVariableCode(value);

  const FreeRerollsCode = `SMODS.change_free_rerolls(${valueCode})`


  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`rellors_value = ${value}`];

  return {
    statement: FreeRerollsCode,
    colour: "G.C.DARK_EDITION",
    configVariables
  };
};

export const generateEditShopPricesReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value;

  const valueCode = generateGameVariableCode(value);

  let ItemPriceCode = "";

    if (operation === "add") {
        ItemPriceCode += `
         G.E_MANAGER:add_event(Event({
            func = function()
           G.GAME.discount_percent = (G.GAME.discount_percent or 0) +${valueCode}
           for _, v in pairs(G.I.CARD) do
                    if v.set_cost then v:set_cost() end
                return true
                end
            end
        }))
        `;
  } else if (operation === "subtract") {
        ItemPriceCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.discount_percent = (G.GAME.discount_percent or 0) -${valueCode}
       for _, v in pairs(G.I.CARD) do
                    if v.set_cost then v:set_cost() end
                return true
                end
            end
        }))
        `;
  } else if (operation === "set") {
        ItemPriceCode += `
        local mod = ${valueCode} - G.GAME.discount_percent
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.discount_percent = ${valueCode}
        for _, v in pairs(G.I.CARD) do
                    if v.set_cost then v:set_cost() end
                return true
                end
            end
        }))
        `;
  } else if (operation === "multiply") {
        ItemPriceCode += `
        local mod = ${valueCode} - G.GAME.discount_percent
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.discount_percent = (G.GAME.discount_percent or 0) *${valueCode}
        for _, v in pairs(G.I.CARD) do
                    if v.set_cost then v:set_cost() end
                return true
                end
            end
        }))
        `;
  } else if (operation === "divide") {
        ItemPriceCode += `
        local mod = ${valueCode} - G.GAME.discount_percent
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.discount_percent = (G.GAME.discount_percent or 0) /${valueCode}
        for _, v in pairs(G.I.CARD) do
                    if v.set_cost then v:set_cost() end
                return true
                end
            end
        }))
        `;
  }

  const configVariables =
    typeof value === "string" && value.startsWith("GAMEVAR:")
      ? []
      : [`items_prices = ${value}`];

  return {
    statement: ItemPriceCode,
    colour: "G.C.BLUE",
    configVariables,
  };
};
