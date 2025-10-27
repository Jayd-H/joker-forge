import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateWinBlindEffectCode = (
  effect: Effect,
  itemType: string,
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect)
    case "consumable":
      return generateConsumableCode(effect)
    case "card":
      return generateCardCode(effect)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateJokerCode = (
  effect: Effect,
): EffectReturn => {
  const customMessage = effect.customMessage;

  const WinBlindCode = `
            G.E_MANAGER:add_event(Event({
    blocking = false,
    func = function()
        if G.STATE == G.STATES.SELECTING_HAND then
            G.GAME.chips = G.GAME.blind.chips
            G.STATE = G.STATES.HAND_PLAYED
            G.STATE_COMPLETE = true
            end_round()
            return true
        end
    end
}))`;

  return {
    statement: `__PRE_RETURN_CODE__${WinBlindCode}__PRE_RETURN_CODE_END__`,
    message: customMessage ? `"${customMessage}"` : `"Win!"`,
    colour: "G.C.ORANGE"
  }
};

const generateConsumableCode = (
  effect: Effect,
): EffectReturn => {
const customMessage = effect.customMessage;

  const WinBlindCode = `
            G.E_MANAGER:add_event(Event({
    blocking = false,
    func = function()
        if G.STATE == G.STATES.SELECTING_HAND then
            G.GAME.chips = G.GAME.blind.chips
            G.STATE = G.STATES.HAND_PLAYED
            G.STATE_COMPLETE = true
            end_round()
            return true
        end
    end
}))`;

  return {
    statement: `__PRE_RETURN_CODE__${WinBlindCode}__PRE_RETURN_CODE_END__`,
    message: customMessage ? `"${customMessage}"` : `"Win!"`,
    colour: "G.C.ORANGE"
  }
}

const generateCardCode = (
  effect: Effect,
): EffectReturn => {
const customMessage = effect.customMessage;

  const WinBlindCode = `
            G.E_MANAGER:add_event(Event({
    blocking = false,
    func = function()
        if G.STATE == G.STATES.SELECTING_HAND then
            G.GAME.chips = G.GAME.blind.chips
            G.STATE = G.STATES.HAND_PLAYED
            G.STATE_COMPLETE = true
            end_round()
            return true
        end
    end
}))`;

  return {
    statement: `__PRE_RETURN_CODE__${WinBlindCode}__PRE_RETURN_CODE_END__`,
    message: customMessage ? `"${customMessage}"` : `"Win!"`,
    colour: "G.C.ORANGE"
  }
}