import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateSetStickerReturn = (effect: Effect): EffectReturn => {
  const sticker = effect.params?.sticker || "none";
  const edition = effect.params?.edition || "none";
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

  let editCardsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    play_sound('tarot1')
                    used_card:juice_up(0.3, 0.5)
                    return true
                end
            }))
            for i = 1, #G.jokers.highlighted do
                local percent = 1.15 - (i - 0.999) / (#G.hand.highlighted - 0.998) * 0.3
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.15,
                    func = function()
                        G.jokers.highlighted[i]:flip()
                        play_sound('card1', percent)
                        G.jokers.highlighted[i]:juice_up(0.3, 0.3)
                        return true
                    end
                }))
            end
            delay(0.2)`;

if (edition !== "none") {
    const editionMap: Record<string, string> = {
      e_foil: "foil",
      e_holo: "holo",
      e_polychrome: "polychrome",
      e_negative: "negative",
    };

    if (edition === "remove") {
      editCardsCode += `
            for i = 1, #G.jokers.highlighted do
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.1,
                    func = function()
                        G.jokers.highlighted[i]:set_edition(nil, true)
                        return true
                    end
                }))
            end`;
    } else if (edition === "random") {
      editCardsCode += `
            for i = 1, #G.jokers.highlighted do
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.1,
                    func = function()
                        local edition = poll_edition('random_edition', nil, true, true, 
                            { 'e_polychrome', 'e_holo', 'e_foil' })
                        G.jokers.highlighted[i]:set_edition(edition, true)
                        return true
                    end
                }))
            end`;
    } else {
      const editionLua =
        editionMap[edition as keyof typeof editionMap] || "foil";
      editCardsCode += `
            for i = 1, #G.jokers.highlighted do
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.1,
                    func = function()
                        G.jokers.highlighted[i]:set_edition({ ${editionLua} = true }, true)
                        return true
                    end
                }))
            end`;
    }
  }

  if (sticker !== "none") {
    if (sticker === "remove") {
      editCardsCode += `
            for i = 1, #G.jokers.highlighted do
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.1,
                    func = function()
                    G.jokers.highlighted[1].ability.eternal = false
                    G.jokers.highlighted[1].ability.rental = false
                    G.jokers.highlighted[1].ability.perishable = false
                        return true
                    end
                }))
            end`;
    } else {
      editCardsCode += `
            for i = 1, #G.jokers.highlighted do
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.1,
                    func = function()
                        G.jokers.highlighted[i]:set_${sticker}(true)
                        return true
                    end
                }))
            end`;
    }
  }
  editCardsCode += `
            for i = 1, #G.jokers.highlighted do
                local percent = 0.85 + (i - 0.999) / (#G.hand.highlighted - 0.998) * 0.3
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.15,
                    func = function()
                        G.jokers.highlighted[i]:flip()
                        play_sound('tarot2', percent, 0.6)
                        G.jokers.highlighted[i]:juice_up(0.3, 0.3)
                        return true
                    end
                }))
            end
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.2,
                func = function()
                    G.jokers:unhighlight_all()
                    return true
                end
            }))
            delay(0.5)
            __PRE_RETURN_CODE_END__`;

  const result: EffectReturn = {
    statement: editCardsCode,
    colour: "G.C.SECONDARY_SET.Tarot",
  };

    if (customMessage) {
    result.message = `"${customMessage}"`;
  }
  return result;
};