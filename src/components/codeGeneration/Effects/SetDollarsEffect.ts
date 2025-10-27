import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import type { EditionData, EnhancementData, SealData } from "../../data/BalatroUtils";
import { generateConfigVariables } from "../gameVariableUtils";
import { generateGameVariableCode } from "../Consumables/gameVariableUtils";

export const generateSetDollarsEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0,
  card?: EnhancementData | EditionData | SealData,
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect, sameTypeCount)
    case "consumable":
      return generateConsumableCode(effect, sameTypeCount)
    case "card":
      return generateCardCode(effect, sameTypeCount, card)
    case "voucher":
      return generateVoucherCode(effect, sameTypeCount)
    case "deck":
      return generateDeckCode(effect)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateJokerCode = (
  effect: Effect,
  sameTypeCount: number = 0,
): EffectReturn => {
  const operation = (effect.params?.operation as string) || "add";
  const variableName =
    sameTypeCount === 0 ? "dollars" : `dollars${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'joker'
  )

  const customMessage = effect.customMessage;

  let result: EffectReturn;
  
  switch (operation) {
    case "add":{
      result = {
        statement: `dollars = ${valueCode}`,
        colour: "G.C.MONEY",
        configVariables:
          configVariables.length > 0 ? configVariables : undefined,
      }
    
      if (customMessage) {
        result.message = `"${customMessage}"`;
      }
      break;
    }

    case "subtract": {
      result = {
        statement: `dollars = -${valueCode}`,
        colour: "G.C.MONEY",
        configVariables:
          configVariables.length > 0 ? configVariables : undefined,
      };

      if (customMessage) {
        result.message = `"${customMessage}"`;
      }
      break;
    }

    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Set to $"..tostring(${valueCode})`;

      result = {
        statement: `func = function()
                    local target_amount = ${valueCode}
                    local current_amount = G.GAME.dollars
                    local difference = target_amount - current_amount
                    ease_dollars(difference)
                    card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.MONEY})
                    return true
                end`,
        colour: "G.C.MONEY",
        configVariables:
          configVariables.length > 0 ? configVariables : undefined,
      };
      break;
    }

    default: {
      result = {
        statement: `dollars = ${valueCode}`,
        colour: "G.C.MONEY",
        configVariables:
          configVariables.length > 0 ? configVariables : undefined,
      };

      if (customMessage) {
        result.message = `"${customMessage}"`;
      }
    }
  }

  return result;
};

const generateConsumableCode = (
  effect: Effect,
  sameTypeCount: number = 0,
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const customMessage = effect.customMessage;
  const variableName =
    sameTypeCount === 0 ? "dollars" : `dollars${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'consumable'
  )
  let dollarsCode = "";

  switch (operation) {
    case "add": {
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." $"`;
      dollarsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.MONEY})
                    ease_dollars(${valueCode}, true)
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    case "subtract": {
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." $"`;
      dollarsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
                    ease_dollars(-math.min(G.GAME.dollars, ${valueCode}), true)
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Set to $"..tostring(${valueCode})`;
      dollarsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    local current_dollars = G.GAME.dollars
                    local target_dollars = ${valueCode}
                    local difference = target_dollars - current_dollars
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.MONEY})
                    ease_dollars(difference, true)
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    default: {
      const defaultMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." $"`;
      dollarsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${defaultMessage}, colour = G.C.MONEY})
                    ease_dollars(${valueCode}, true)
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
    }
  }

  return {
    statement: dollarsCode,
    colour: "G.C.MONEY",
    configVariables,
  };
};


const generateCardCode = (
  effect: Effect,
  sameTypeCount: number = 0,
  card?: EditionData | EnhancementData | SealData
): EffectReturn => {
  const operation = (effect.params?.operation as string) || "add";
  const variableName =
    sameTypeCount === 0 ? "dollars" : `dollars${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    card?.objectType ?? 'enhancement'
  );

  const customMessage = effect.customMessage;

  let result: EffectReturn;

  switch (operation) {
    case "add": {
      result = {
        statement: `dollars = lenient_bignum(${valueCode})`,
        colour: "G.C.MONEY",
        configVariables
      };

      if (customMessage) {
        result.message = `"${customMessage}"`;
      }
      break;
    }

    case "subtract": {
      result = {
        statement: `dollars = -lenient_bignum(${valueCode})`,
        colour: "G.C.MONEY",
        configVariables
      };

      if (customMessage) {
        result.message = `"${customMessage}"`;
      }
      break;
    }

    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Set to $"..tostring(${valueCode})`;

      result = {
        statement: `func = function()
                    local target_amount = ${valueCode}
                    local current_amount = G.GAME.dollars
                    local difference = target_amount - current_amount
                    ease_dollars(difference)
                    card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.MONEY})
                    return true
                end`,
        colour: "G.C.MONEY",
        configVariables
      };
      break;
    }

    default: {
      result = {
        statement: `dollars = lenient_bignum(${valueCode})`,
        colour: "G.C.MONEY",
        configVariables
      };

      if (customMessage) {
        result.message = `"${customMessage}"`;
      }
    }
  }

  return result;
}

const generateVoucherCode = (
  effect: Effect,
  sameTypeCount: number = 0,
): EffectReturn => {
  const operation = effect.params?.operation || "add";

  const variableName =
    sameTypeCount === 0 ? "dollars" : `dollars${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'voucher'
  )

  let dollarsCode = "";

    if (operation === "add") {
        dollarsCode += `
        ease_dollars(${valueCode}, true)
        `;
  } else if (operation === "subtract") {
        dollarsCode += `
        ease_dollars(-math.min(G.GAME.dollars, ${valueCode}), true)
        `;
  } else if (operation === "set") {
        dollarsCode += `
          local current_dollars = G.GAME.dollars
                    local target_dollars = ${valueCode}
                    local difference = target_dollars - current_dollars
                    ease_dollars(difference, true)
        `;
  }

  return {
    statement: dollarsCode,
    colour: "G.C.MONEY",
    configVariables,
  };
};

const generateDeckCode = (
  effect: Effect,
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value;

  const valueCode = generateGameVariableCode(value);

  let dollarsCode = "";

    if (operation === "add") {
        dollarsCode += `
        G.GAME.starting_params.dollars = G.GAME.starting_params.dollars +${valueCode}
        `;
  } else if (operation === "subtract") {
        dollarsCode += `
        G.GAME.starting_params.dollars = G.GAME.starting_params.dollars -${valueCode}
        `;
  } else if (operation === "set") {
        dollarsCode += `
          G.GAME.starting_params.dollars = ${valueCode}
        `;
  }

  return {
    statement: `__PRE_RETURN_CODE__
                   ${dollarsCode}
                    __PRE_RETURN_CODE_END__`,
    colour: "G.C.MONEY"
  };
};


export const generateEditDollarsCalculateReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value;

  const valueCode = generateGameVariableCode(value);

  let dollarsCode = "";

    if (operation === "add") {
        dollarsCode += `
        ease_dollars(${valueCode})
        `;
  } else if (operation === "subtract") {
        dollarsCode += `
        ease_dollars(-${valueCode})
        `;
  } else if (operation === "set") {
        dollarsCode += `
          local current_dollars = G.GAME.dollars
                    local target_dollars = ${valueCode}
                    local difference = target_dollars - current_dollars
                    ease_dollars(difference)
        `;
  }

  return {
    statement: `__PRE_RETURN_CODE__
                   ${dollarsCode}
                    __PRE_RETURN_CODE_END__`,
    colour: "G.C.MONEY"
  };
};
