import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import type { ConsumableData, DeckData, EditionData, EnhancementData, JokerData, SealData, VoucherData } from "../../data/BalatroUtils";

export const generatePlaySoundReturn = (
  effect: Effect,
  itemType: string,
  joker?: JokerData,
  consumable?: ConsumableData,
  card?: EnhancementData | EditionData | SealData,
  voucher?: VoucherData,
  deck?: DeckData,
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect, 0, joker)
    case "consumable":
      return generateConsumableCode(effect, consumable)
    case "card":
      return generateCardCode(effect, card)
    case "voucher":
      return generateVoucherCode(effect, voucher)
    case "deck":
      return generateDeckCode(effect, deck)

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
  const key = effect.params.sound_key as string || "";

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
  consumable?: ConsumableData
): EffectReturn => {
  const key = effect.params.sound_key as string || "";

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
  card?: EditionData | EnhancementData | SealData
): EffectReturn => {
  const key = effect.params.sound_key as string || "";

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
  voucher?: VoucherData
): EffectReturn => {
  const key = effect.params.sound_key as string || "";

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
  deck?: DeckData
): EffectReturn => {
  const key = effect.params.sound_key as string || "";

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