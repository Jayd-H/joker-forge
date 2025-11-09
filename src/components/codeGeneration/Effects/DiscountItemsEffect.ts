import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn, PassiveEffectResult } from "../lib/effectUtils";
import { generateConfigVariables } from "../lib/gameVariableUtils";

export const generateDiscountItemsPassiveEffectCode = (
  effect: Effect,
  jokerKey: string
): PassiveEffectResult => {
  const discountType = (effect.params?.discount_type as string) || "planet";
  const discountMethod =
    (effect.params?.discount_method as string) || "make_free";

  const variableName = "discount_amount";

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.discount_amount,
    effect.id,
    variableName,
    "hook"
  );

  return {
    addToDeck: `G.E_MANAGER:add_event(Event({
    func = function()
        for k, v in pairs(G.I.CARD) do
            if v.set_cost then v:set_cost() end
        end
        return true
    end
}))`,
    removeFromDeck: `G.E_MANAGER:add_event(Event({
    func = function()
        for k, v in pairs(G.I.CARD) do
            if v.set_cost then v:set_cost() end
        end
        return true
    end
}))`,
    configVariables:
      configVariables.length > 0
        ? configVariables.map((cv) => cv.name + " = " + cv.value)
        : [],
    locVars: [],
    needsHook: {
      hookType: "discount_items",
      jokerKey: jokerKey,
      effectParams: {
        discountType,
        discountMethod,
        discountAmount: valueCode,
      },
    },
  };
};


export const generateDiscountItemsEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0
): EffectReturn => {
  switch(itemType) {
    case "voucher":
      return generateVoucherCode(effect, sameTypeCount)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateVoucherCode = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = effect.params?.operation as string|| "add";

  const variableName =
    sameTypeCount === 0 ? "item_prices" : `item_prices${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'voucher'
  );

  let ItemPriceCode = "";

    if (operation === "add") {
        ItemPriceCode += `
         G.E_MANAGER:add_event(Event({
            func = function()
           G.GAME.discount_percent = (G.GAME.discount_percent or 0) + ${valueCode}
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
        G.GAME.discount_percent = (G.GAME.discount_percent or 0) - ${valueCode}
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
        G.GAME.discount_percent = (G.GAME.discount_percent or 0) * ${valueCode}
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
        G.GAME.discount_percent = (G.GAME.discount_percent or 0) / ${valueCode}
        for _, v in pairs(G.I.CARD) do
                    if v.set_cost then v:set_cost() end
                return true
                end
            end
        }))
        `;
  }

  return {
    statement: ItemPriceCode,
    colour: "G.C.BLUE",
    configVariables,
  };
}