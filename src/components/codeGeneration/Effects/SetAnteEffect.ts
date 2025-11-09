import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";
import { generateConfigVariables } from "../lib/gameVariableUtils";

export const generateSetAnteEffectCode = (
  effect: Effect,
  itemType: string,
  triggerType: string,
  sameTypeCount: number = 0
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect, triggerType, sameTypeCount)
    case "consumable":
      return generateConsumableCode(effect, sameTypeCount)
    case "voucher":
      return generateVoucherCode(effect, sameTypeCount)
    case "deck":
      return generateDeckCode(effect, sameTypeCount)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateJokerCode = (
  effect: Effect,
  triggerType: string,
  sameTypeCount: number = 0,
): EffectReturn => {
  const operation = (effect.params?.operation as string) || "set";

  const variableName =
    sameTypeCount === 0 ? "ante_value" : `ante_value${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'joker'
  )

  const customMessage = effect.customMessage ? `"${effect.customMessage}"` : undefined;
  let anteCode = "";
  let messageText = "";

  switch (operation) {
    case "set":
      anteCode = `local mod = ${valueCode} - G.GAME.round_resets.ante
    ease_ante(mod)
    G.E_MANAGER:add_event(Event({
      func = function()
        G.GAME.round_resets.blind_ante = ${valueCode}
        return true
      end,
    }))`;
      messageText = customMessage || `"Ante set to " .. ${valueCode} .. "!"`;
      break;
    case "add":
      anteCode = `local mod = ${valueCode}
    ease_ante(mod)
    G.E_MANAGER:add_event(Event({
      func = function()
        G.GAME.round_resets.blind_ante = G.GAME.round_resets.blind_ante + mod
        return true
      end,
    }))`;
      messageText = customMessage || `"Ante +" .. ${valueCode}`;
      break;
    case "subtract":
      anteCode = `local mod = -${valueCode}
    ease_ante(mod)
    G.E_MANAGER:add_event(Event({
      func = function()
        G.GAME.round_resets.blind_ante = G.GAME.round_resets.blind_ante + mod
        return true
      end,
    }))`;
      messageText = customMessage || `"Ante -" .. ${valueCode}`;
      break;
    default:
      anteCode = `local mod = ${valueCode} - G.GAME.round_resets.ante
    ease_ante(mod)
    G.E_MANAGER:add_event(Event({
      func = function()
        G.GAME.round_resets.blind_ante = ${valueCode}
        return true
      end,
    }))`;
      messageText = customMessage || `"Ante set to " .. ${valueCode} .. "!"`;
  }

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  const result: EffectReturn = {
    statement: isScoring
      ? `__PRE_RETURN_CODE__${anteCode}
                __PRE_RETURN_CODE_END__`
      : `func = function()
                    ${anteCode}
                    return true
                end`,
    message: customMessage ? `"${customMessage}"` : messageText,
    colour: "G.C.FILTER",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };

  return result;
};

const generateConsumableCode = (
  effect: Effect,
  sameTypeCount: number = 0,
): EffectReturn => {
  const operation = effect.params?.operation || "set";
  const variableName =
    sameTypeCount === 0 ? "ante_value" : `ante_value${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'voucher'
  )
  const customMessage = effect.customMessage;

  let anteCode = "";
  
  switch (operation) {
    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Ante set to "..tostring(${valueCode})`;
      anteCode = `
            __PRE_RETURN_CODE__
local mod = ${valueCode} - G.GAME.round_resets.ante
		ease_ante(mod)
		G.E_MANAGER:add_event(Event({
			func = function()
				G.GAME.round_resets.blind_ante = ${valueCode}
        card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.YELLOW})
				return true
			end,
		}))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    case "add": {
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Ante"`;
      anteCode = `
            __PRE_RETURN_CODE__
local mod = ${valueCode}
		ease_ante(mod)
		G.E_MANAGER:add_event(Event({
			func = function()
				G.GAME.round_resets.blind_ante = G.GAME.round_resets.blind_ante + mod
        card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.YELLOW})
				return true
			end,
		}))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    case "subtract": {
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." Ante"`;
      anteCode = `
            __PRE_RETURN_CODE__
local mod = -${valueCode}
		ease_ante(mod)
		G.E_MANAGER:add_event(Event({
			func = function()
				G.GAME.round_resets.blind_ante = G.GAME.round_resets.blind_ante + mod
        card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
				return true
			end,
    }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    default: {
      const defaultMessage = customMessage
        ? `"${customMessage}"`
        : `"Ante set to "..tostring(${valueCode})`;
      anteCode = `
            __PRE_RETURN_CODE__
local mod = ${valueCode} - G.GAME.round_resets.ante
		ease_ante(mod)
		G.E_MANAGER:add_event(Event({
			func = function()
				G.GAME.round_resets.blind_ante = ${valueCode}
        card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${defaultMessage}, colour = G.C.YELLOW})
				return true
			end,
		}))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
  }

  return {
    statement: anteCode,
    colour: "G.C.YELLOW",
    configVariables,
  };
};


const generateVoucherCode = (
  effect: Effect,
  sameTypeCount: number = 0,
): EffectReturn => {
  const operation = effect.params?.operation || "set";
  const variableName =
    sameTypeCount === 0 ? "ante_value" : `ante_value${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'voucher'
  )

  let anteCode = "";
  
    if (operation === "add") {
        anteCode += `local mod = ${valueCode}
        ease_ante(mod)
        G.GAME.round_resets.blind_ante = G.GAME.round_resets.blind_ante + mod
        `;
  } else if (operation === "subtract") {
        anteCode += `local mod = -${valueCode}
        ease_ante(mod)
        G.GAME.round_resets.blind_ante = G.GAME.round_resets.blind_ante + mod
        `;
  } else if (operation === "set") {
        anteCode += `local mod = ${valueCode} - G.GAME.round_resets.ante
        ease_ante(mod)
     G.GAME.round_resets.blind_ante = ${valueCode}
        `;
  }

  return {
    statement: anteCode,
    colour: "G.C.YELLOW",
    configVariables,
  };
};

const generateDeckCode = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = effect.params?.operation || "set";
  const variableName =
    sameTypeCount === 0 ? "ante_value" : `ante_value${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'voucher'
  )
  let anteCode = "";
  
    if (operation === "add") {
        anteCode += `
local mod = ${valueCode}
    G.E_MANAGER:add_event(Event({
      func = function()
      ease_ante(mod)
        G.GAME.round_resets.blind_ante = G.GAME.round_resets.blind_ante + mod
        return true
      end,
    }))
      `;
  } else if (operation === "subtract") {
        anteCode += `
local mod = -${valueCode}
    G.E_MANAGER:add_event(Event({
      func = function()
      ease_ante(mod)
        G.GAME.round_resets.blind_ante = G.GAME.round_resets.blind_ante + mod
        return true
      end,
    }))
        `;
  } else if (operation === "set") {
        anteCode += `
    local mod = ${valueCode} - G.GAME.round_resets.ante
    G.E_MANAGER:add_event(Event({
            func = function()
    ease_ante(mod)
    G.GAME.round_resets.blind_ante = ${valueCode}
    return true
            end
        }))
        `;
  }

  return {
    statement: `__PRE_RETURN_CODE__${anteCode}__PRE_RETURN_CODE_END__`,
    colour: "G.C.YELLOW",
    configVariables,
  };
};
