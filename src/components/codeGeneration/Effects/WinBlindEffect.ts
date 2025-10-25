import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import type { ConsumableData, EditionData, EnhancementData, JokerData, SealData } from "../../data/BalatroUtils";

export const generateWinBlindReturn = (
  effect: Effect,
  itemType: string,
  joker?: JokerData,
  consumable?: ConsumableData,
  card?: EnhancementData | EditionData | SealData,
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect, 0, joker)
    case "consumable":
      return generateConsumableCode(effect, consumable)
    case "card":
      return generateCardCode(effect, card)

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
  joker?: JokerData
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
  consumable?: ConsumableData
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
  card?: EditionData | EnhancementData | SealData
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