import type { Effect } from "../../../ruleBuilder/types";
import type { PassiveEffectResult } from "../effectUtils";
import { generateConfigVariables } from "../gameVariableUtils";

export const generateFreeRerollsReturn = (
  effect: Effect
): PassiveEffectResult => {
  const variableName = "reroll_amount";

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName
  );

  return {
    addToDeck: `SMODS.change_free_rerolls(${valueCode})`,
    removeFromDeck: `SMODS.change_free_rerolls(-(${valueCode}))`,
    configVariables:
      configVariables.length > 0
        ? configVariables.map((cv) => cv.name + " = " + cv.value)
        : [],
    locVars: [],
  };
};

export const generateDiscountItemsReturn = (
  effect: Effect,
  jokerKey?: string
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
      jokerKey: jokerKey || "PLACEHOLDER",
      effectParams: {
        discountType,
        discountMethod,
        discountAmount: valueCode,
      },
    },
  };
};

export const generateDiscountItemsHook = (
  discountJokers: Array<{
    jokerKey: string;
    params: {
      discountType: string;
      discountMethod: string;
      discountAmount: string;
    };
  }>,
  modPrefix: string
): string => {
  if (discountJokers.length === 0) return "";

  let hookCode = `
local card_set_cost_ref = Card.set_cost
function Card:set_cost()
    card_set_cost_ref(self)`;

  discountJokers.forEach(({ jokerKey, params }) => {
    let costCondition = "";
    let costLogic = "";

    switch (params.discountType) {
      case "planet":
        costCondition =
          "(self.ability.set == 'Planet' or (self.ability.set == 'Booster' and self.config.center.kind == 'Celestial'))";
        break;
      case "tarot":
        costCondition =
          "(self.ability.set == 'Tarot' or (self.ability.set == 'Booster' and self.config.center.kind == 'Arcana'))";
        break;
      case "spectral":
        costCondition =
          "(self.ability.set == 'Spectral' or (self.ability.set == 'Booster' and self.config.center.kind == 'Spectral'))";
        break;
      case "standard":
        costCondition =
          "(self.ability.set == 'Enhanced' or (self.ability.set == 'Booster' and self.config.center.kind == 'Standard'))";
        break;
      case "jokers":
        costCondition = "self.ability.set == 'Joker'";
        break;
      case "vouchers":
        costCondition = "self.ability.set == 'Voucher'";
        break;
      case "all_consumables":
        costCondition =
          "(self.ability.set == 'Tarot' or self.ability.set == 'Planet' or self.ability.set == 'Spectral')";
        break;
      case "all_cards":
        costCondition =
          "(self.ability.set == 'Joker' or self.ability.set == 'Tarot' or self.ability.set == 'Planet' or self.ability.set == 'Spectral' or self.ability.set == 'Enhanced' or self.ability.set == 'Booster')";
        break;
      case "all_shop_items":
        costCondition =
          "(self.ability.set == 'Joker' or self.ability.set == 'Tarot' or self.ability.set == 'Planet' or self.ability.set == 'Spectral' or self.ability.set == 'Enhanced' or self.ability.set == 'Booster' or self.ability.set == 'Voucher')";
        break;
    }

    const fullJokerKey = `j_${modPrefix}_${jokerKey}`;
    const discountAmountCode = params.discountAmount;

    switch (params.discountMethod) {
      case "make_free":
        costLogic = "self.cost = 0";
        break;
      case "flat_reduction":
        costLogic = `self.cost = math.max(0, self.cost - (${discountAmountCode}))`;
        break;
      case "percentage_reduction":
        costLogic = `self.cost = math.max(0, math.floor(self.cost * (1 - (${discountAmountCode}) / 100)))`;
        break;
    }

    hookCode += `
    
    if next(SMODS.find_card("${fullJokerKey}")) then
        if ${costCondition} then
            ${costLogic}
        end
    end`;
  });

  hookCode += `
    
    self.sell_cost = math.max(1, math.floor(self.cost / 2)) + (self.ability.extra_value or 0)
    self.sell_cost_label = self.facing == 'back' and '?' or self.sell_cost
end`;

  return hookCode;
};
