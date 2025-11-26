import { EDITIONS } from "../../data/BalatroUtils";
import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";

export const generateEditJokerEffectCode = (
  effect: Effect,
  itemType: string,
  modPrefix: string,
): EffectReturn => {
  switch(itemType) {
    case "consumable":
      return generateConsumableCode(effect, modPrefix)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateConsumableCode = (
  effect: Effect,
  modPrefix: string,
): EffectReturn => {
  const sticker = (effect.params?.sticker?.value as string) || "none";
  const edition = (effect.params?.edition?.value as string) || "none";
  const target = (effect.params?.target?.value as string) || "random";
  const customMessage = effect.customMessage;

  const hasModifications = [edition, sticker].some(
    (param) => param !== "none"
  );

  if (!hasModifications) {
    return {
      statement: "",
      colour: "G.C.WHITE",
    };
  }
  const targetCode = (target === "random") ? 'local index = math.random(1, #G.jokers.cards)' : ''
  const targetJoker = (target === "selected") ? `G.jokers.highlighted[1]` : `G.jokers.cards[index]`
  const editionPool = EDITIONS().map(edition => `'${
    edition.key.startsWith('e_') ? edition.key : `e_${modPrefix}_${edition.key}`}'`)
    
  let editionCode = ''

  if (edition !== "none") {
    switch (edition) {
      case "remove":
        editionCode = `
          ${targetJoker}:set_edition(nil, true)`
        break
      case "random":
        editionCode = `
          local edition = pseudorandom_element({${editionPool}}, 'random edition')
          ${targetJoker}:set_edition(edition, true)`
        break
      default: 
        editionCode = `
          ${targetJoker}:set_edition("${edition}", true)`
        break
    }
    editionCode = `
      G.E_MANAGER:add_event(Event({
          trigger = 'after',
          delay = 0.1,
          func = function()
              ${editionCode}
              return true
          end
      }))`
  }

  let stickerCode = ''

  if (sticker !== "none") {
    switch (sticker) {
      case "remove":
        stickerCode = `
          ${targetJoker}.ability.eternal = false
          ${targetJoker}.ability.rental = false
          ${targetJoker}.ability.perishable = false`
        break
      default:
        stickerCode = `
          ${targetJoker}:add_sticker('${sticker}', true)`
        break
    }
    stickerCode = `
      G.E_MANAGER:add_event(Event({
          trigger = 'after',
          delay = 0.1,
          func = function()
              ${stickerCode}
              return true
          end
      }))`
  }

  const result: EffectReturn = {
    statement: `__PRE_RETURN_CODE__
    ${targetCode}
    G.E_MANAGER:add_event(Event({
        trigger = 'after',
        delay = 0.4,
        func = function()
            play_sound('timpani')
            used_card:juice_up(0.3, 0.5)
            return true
        end
    }))
    local percent = 1.15 - (i - 0.999) / (#G.hand.highlighted - 0.998) * 0.3
    G.E_MANAGER:add_event(Event({
        trigger = 'after',
        delay = 0.15,
        func = function()
            
            ${targetJoker}:flip()
            play_sound('card1', percent)
            ${targetJoker}:juice_up(0.3, 0.3)
            return true
        end
    }))
    delay(0.2)
    ${editionCode}
    ${stickerCode}
    local percent = 0.85 + (i - 0.999) / (#G.hand.highlighted - 0.998) * 0.3
    G.E_MANAGER:add_event(Event({
        trigger = 'after',
        delay = 0.15,
        func = function()
            ${targetJoker}:flip()
            play_sound('tarot2', percent, 0.6)
            ${targetJoker}:juice_up(0.3, 0.3)
            return true
        end
    }))
    G.E_MANAGER:add_event(Event({
        trigger = 'after',
        delay = 0.2,
        func = function()
            G.jokers:unhighlight_all()
            return true
        end
    }))
    delay(0.5)
      __PRE_RETURN_CODE_END__`,
    colour: "G.C.SECONDARY_SET.Tarot",
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }
  
  return result;
}