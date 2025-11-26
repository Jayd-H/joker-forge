import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";

export const generatePlaySoundEffectCode = (
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
    case "voucher":
      return generateVoucherCode(effect)
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
): EffectReturn => {
  const key = (effect.params?.sound_key?.value as string) || "";

  const customMessage = effect.customMessage

  return {
    colour: "G.C.BLUE",
    statement: `__PRE_RETURN_CODE__
    G.E_MANAGER:add_event(Event({
     func = function()
    play_sound("${key}")
    ${customMessage ? `SMODS.calculate_effect({message = "${customMessage}"}, card)` : ""}
    return true
    end,
})) 
    __PRE_RETURN_CODE_END__`
  }
};

const generateConsumableCode = (
  effect: Effect,
): EffectReturn => {
  const key = (effect.params?.sound_key?.value as string) || "";

  const customMessage = effect.customMessage

  return {
    colour: "G.C.BLUE",
    statement: `__PRE_RETURN_CODE__
    G.E_MANAGER:add_event(Event({
     func = function()
    play_sound("${key}")
    ${customMessage ? `SMODS.calculate_effect({message = "${customMessage}"}, card)` : ""}
    return true
    end,
})) 
    __PRE_RETURN_CODE_END__`
  }
}

const generateCardCode = (
  effect: Effect,
): EffectReturn => {
  const key = (effect.params?.sound_key?.value as string) || "";

  const customMessage = effect.customMessage

  return {
    colour: "G.C.BLUE",
    statement: `__PRE_RETURN_CODE__
    G.E_MANAGER:add_event(Event({
     func = function()
    play_sound("${key}")
    ${customMessage ? `SMODS.calculate_effect({message = "${customMessage}"}, card)` : ""}
    return true
    end,
})) 
    __PRE_RETURN_CODE_END__`
  }
}

const generateVoucherCode = (
  effect: Effect,
): EffectReturn => {
  const key = (effect.params?.sound_key?.value as string) || "";

  return {
    colour: "G.C.BLUE",
    statement: `__PRE_RETURN_CODE__
    G.E_MANAGER:add_event(Event({
     func = function()
    play_sound("${key}")
    return true
    end,
})) 
    __PRE_RETURN_CODE_END__`
  }
}

const generateDeckCode = (
  effect: Effect,
): EffectReturn => {
  const key = (effect.params?.sound_key?.value as string) || "";

  return {
    colour: "G.C.BLUE",
    statement: `__PRE_RETURN_CODE__
    G.E_MANAGER:add_event(Event({
     func = function()
    play_sound("${key}")
    return true
    end,
})) 
    __PRE_RETURN_CODE_END__`
  }
}