import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";

export const generateCreateJokerReturn = (
  effect: Effect,
  triggerType: string,
  modprefix: string
): EffectReturn => {
  const jokerType = (effect.params?.joker_type as string) || "random";
  const rarity = (effect.params?.rarity as string) || "random";
  const jokerKey = (effect.params?.joker_key as string) || "";
  const pool = (effect.params?.pool as string) || "";
  const edition = (effect.params?.edition as string) || "none";
  const customMessage = effect.customMessage;
  const sticker = (effect.params?.sticker as string) || "none";
  const ignoreSlotsParam = (effect.params?.ignore_slots as string) || "respect";

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);
  const isNegative = edition === "e_negative";
  const hasSticker = sticker !== "none";
  const ignoreSlots = ignoreSlotsParam === "ignore";

  const normalizedJokerKey = jokerKey.startsWith("j_")
    ? jokerKey
    : `j_${jokerKey}`;

  const cardParams = [];

  if (pool && pool.trim()) {
    const finalPool = modprefix ? `${modprefix}_${pool.trim()}` : pool.trim();
    cardParams.push(`set = '${finalPool}'`);
  } else {
    cardParams.push(`set = 'Joker'`);
  }

  if (jokerType === "specific" && normalizedJokerKey) {
    cardParams.push(`key = '${normalizedJokerKey}'`);
  } else if (rarity !== "random" && (!pool || !pool.trim())) {
    const rarityMap: Record<string, string> = {
      common: "Common",
      uncommon: "Uncommon",
      rare: "Rare",
      legendary: "Legendary",
    };
    const isVanillaRarity = Object.keys(rarityMap).includes(
      rarity.toLowerCase()
    );
    const finalRarity = isVanillaRarity
      ? rarityMap[rarity.toLowerCase()]
      : modprefix
      ? `${modprefix}_${rarity}`
      : rarity;
    cardParams.push(`rarity = '${finalRarity}'`);
  }
  let slotLimitCode: string;
  
  if (isNegative || ignoreSlots) {
    slotLimitCode = "local created_joker = true";
  } else {
    slotLimitCode = `local created_joker = false
    if #G.jokers.cards + G.GAME.joker_buffer < G.jokers.config.card_limit then
        created_joker = true
        G.GAME.joker_buffer = G.GAME.joker_buffer + 1`;
  }

  const cardCreationCode = `local joker_card = SMODS.add_card({ ${cardParams.join(
    ", "
  )} })`;
  const editionCode =
    edition !== "none" ? `joker_card:set_edition("${edition}", true)` : ``;

  const stickerCode = hasSticker
    ? `joker_card:add_sticker('${sticker}', true)`
    : "";

  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__
                  ${slotLimitCode}
                  G.E_MANAGER:add_event(Event({
                      func = function()
                          ${cardCreationCode}
                          if joker_card then
                              ${editionCode}
                              ${stickerCode}
                          end
                          ${
                            !(isNegative || ignoreSlots)
                              ? "G.GAME.joker_buffer = 0"
                              : ""
                          }
                          return true
                      end
                  }))
                  ${!(isNegative || ignoreSlots) ? "end" : ""}
                __PRE_RETURN_CODE_END__`,
      message: customMessage
        ? `"${customMessage}"`
        : `created_joker and localize('k_plus_joker') or nil`,
      colour: "G.C.BLUE",
    };
  } else {
    return {
      statement: `func = function()
            ${slotLimitCode}
            G.E_MANAGER:add_event(Event({
                func = function()
                    ${cardCreationCode}
                    if joker_card then
                        ${editionCode}
                        ${stickerCode}
                    end
                    ${
                      !(isNegative || ignoreSlots)
                        ? "G.GAME.joker_buffer = 0"
                        : ""
                    }
                    return true
                end
            }))
            ${!(isNegative || ignoreSlots) ? "end" : ""}
            if created_joker then
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${
                  customMessage
                    ? `"${customMessage}"`
                    : `localize('k_plus_joker')`
                }, colour = G.C.BLUE})
            end
            return true
        end`,
      colour: "G.C.BLUE",
    };
  }
};
