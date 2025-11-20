import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";
import { generateConfigVariables } from "../lib/gameVariableUtils";

export const generateEditWinnerAnteEffectCode = (
  effect: Effect,
  itemType: string,
  triggerType: string, 
  sameTypeCount: number = 0
): EffectReturn => {
  switch(itemType) {
    case "joker":
    case "voucher":
      return generateJokerAndVoucherCode(effect, triggerType, sameTypeCount)
    case "consumable":
      return generateConsumableCode(effect, sameTypeCount)
    case "deck":
      return generateDeckCode(effect, sameTypeCount)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateJokerAndVoucherCode = (
  effect: Effect,
  triggerType: string,
  sameTypeCount: number = 0,
): EffectReturn => {
  const operation = effect.params?.operation.value || "set";

 const variableName =
     sameTypeCount === 0 ? "winner_ante_value" : `winner_ante_value${sameTypeCount + 1}`;
 
   const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
     variableName,
     'joker'
   )
  const customMessage = effect.customMessage ? `"${effect.customMessage}"` : undefined;

  let anteCode = "";
  let messageText = "";

  switch (operation) {
    case "set":
      anteCode = `
            G.E_MANAGER:add_event(Event({
                func = function()
                    G.GAME.win_ante = ${valueCode}
                    return true
                end
            }))`;
      messageText = customMessage || `"Winner Ante set to " .. ${valueCode} .. "!"`;
      break;
  case "add":
      anteCode = `
      G.E_MANAGER:add_event(Event({
                func = function()
                    local ante = G.GAME.win_ante + ${valueCode}
                    local int_part, frac_part = math.modf(ante)
                    local rounded = int_part + (frac_part >= 0.5 and 1 or 0)
                    G.GAME.win_ante = rounded
                    return true
                end
            }))`;
      messageText = customMessage || `"Winner Ante +" .. ${valueCode}`;
      break;
    case "subtract":
      anteCode = `
      G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    local ante = G.GAME.win_ante - ${valueCode}
                    local int_part, frac_part = math.modf(ante)
                    local rounded = int_part + (frac_part >= 0.5 and 1 or 0)
                    G.GAME.win_ante = rounded
                    return true
                end
            }))`;
      messageText = customMessage || `"Winner Ante -" .. ${valueCode}`;
      break;
    default:
      anteCode = `
      G.E_MANAGER:add_event(Event({
                func = function()
                    G.GAME.win_ante = ${valueCode}
                    return true
                end
            }))`;
      messageText = customMessage || `"Winner Ante set to " .. ${valueCode} .. "!"`;
  }

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  return {
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
}

const generateConsumableCode = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = effect.params?.operation.value || "set";
  const customMessage = effect.customMessage;

  const variableName =
     sameTypeCount === 0 ? "winner_ante_value" : `winner_ante_value${sameTypeCount + 1}`;
 
  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
    variableName,
    'consumable'
  )

  let EditWinCode = "";

  switch (operation) {
    case "add": {
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Ante to Win"`;
      EditWinCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.BLUE})
                    local ante = G.GAME.win_ante + ${valueCode}
                    local int_part, frac_part = math.modf(ante)
                    local rounded = int_part + (frac_part >= 0.5 and 1 or 0)
                    G.GAME.win_ante = rounded
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
        : `"-"..tostring(${valueCode}).." Ante to Win"`;
      EditWinCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
                    local ante = G.GAME.win_ante - ${valueCode}
                    local int_part, frac_part = math.modf(ante)
                    local rounded = int_part + (frac_part >= 0.5 and 1 or 0)
                    G.GAME.win_ante = rounded
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
        : `"Winner Ante set to "..tostring(${valueCode})`;
      EditWinCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
                    G.GAME.win_ante = ${valueCode}
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
        : `"Winner Ante set to "..tostring(${valueCode}"`;
      EditWinCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${defaultMessage}, colour = G.C.BLUE})
                    G.GAME.win_ante = ${valueCode}
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
    }
  }

  return {
    statement: EditWinCode,
    colour: "G.C.BLUE",
    configVariables,
  };
};

const generateDeckCode = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = effect.params?.operation.value || "set";
  const variableName =
     sameTypeCount === 0 ? "winner_ante_value" : `winner_ante_value${sameTypeCount + 1}`;
 
  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
    variableName,
    'deck'
  )

  let EditWinCode = "";

     if (operation === "add") {
        EditWinCode += `
        local ante = G.GAME.win_ante + ${valueCode}
        local int_part, frac_part = math.modf(ante)
        local rounded = int_part + (frac_part >= 0.5 and 1 or 0)
        G.GAME.win_ante = rounded
        `;
  } else if (operation === "subtract") {
        EditWinCode += `
        local ante = G.GAME.win_ante - ${valueCode}
        local int_part, frac_part = math.modf(ante)
        local rounded = int_part + (frac_part >= 0.5 and 1 or 0)
        G.GAME.win_ante = rounded
        `;
  } else if (operation === "set") {
        EditWinCode += `
        G.GAME.win_ante = ${valueCode}
            `;
  } else if (operation === "multiply") {
        EditWinCode += `
        local ante = G.GAME.win_ante * ${valueCode}
        local int_part, frac_part = math.modf(ante)
        local rounded = int_part + (frac_part >= 0.5 and 1 or 0)
        G.GAME.win_ante = rounded
            `;
  } else if (operation === "divide") {
        EditWinCode += `
        local ante = G.GAME.win_ante / ${valueCode}
        local int_part, frac_part = math.modf(ante)
        local rounded = int_part + (frac_part >= 0.5 and 1 or 0)
        G.GAME.win_ante = rounded
            `;
  }

  return {
    statement: `__PRE_RETURN_CODE__${EditWinCode}__PRE_RETURN_CODE_END__`,
    colour: "G.C.BLUE",
    configVariables,
  };
};
