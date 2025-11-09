import type { Effect } from "../../../ruleBuilder/types";
import {
  generateConfigVariables
} from "../gameVariableUtils";
import type { EffectReturn } from "../effectUtils";

export const generateEditWinnerAnteReturn = (  
  effect: Effect,
  triggerType: string,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = effect.params?.operation || "set";

 const variableName =
     sameTypeCount === 0 ? "winner_ante_value" : `winner_ante_value${sameTypeCount + 1}`;
 
   const { valueCode, configVariables } = generateConfigVariables(
     effect.params?.value,
     effect.id,
     variableName
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
};
