import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";

export const generateAddStickerReturn = (
  effect: Effect,
  triggerType: string,
  modprefix: string
): EffectReturn => {
  const jokerType = (effect.params?.joker_type as string) || "random";
  const rarity = (effect.params?.rarity as string) || "random";
  const jokerKey = (effect.params?.joker_key as string) || "";
  const pool = (effect.params?.pool as string) || "";
  const customMessage = effect.customMessage;
  const sticker = (effect.params?.sticker as string) || "none";
  const edition = effect.params?.edition || "none";

  
  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);
  const hasSticker = sticker !== "none";
  const hasEdition = edition !== "none";


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

  const editionCode = hasEdition
    ? `
  joker_card:set_edition("${edition}", true)`
    : "";

    const addstickerCode = hasSticker
    ? `joker_card:set_${sticker}(true)`
    : "";

    const removestickerCode = hasSticker
    ? `joker_card.ability.eternal = false
       joker_card.ability.rental = false
      joker_card.ability.perishable = false`
    : "";

    if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__
                  G.E_MANAGER:add_event(Event({
                      func = function()
                          if joker_card then
                             ${addstickerCode}dd
                              ${addstickerCode}
                          end
                          return true
                      end
                  }))
                __PRE_RETURN_CODE_END__`,
      message: customMessage
        ? `"${customMessage}"`
        : `created_joker and localize('k_plus_joker') or nil`,
      colour: "G.C.BLUE",
    };
  } else {
    return {
      statement: `func = function()
            G.E_MANAGER:add_event(Event({
                func = function()
                    if joker_card then
                        ${removestickerCode}
                    end
                        ? "G.GAME.joker_buffer = 0"
                        : ""
                    }
                    return true
                end
            }))
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
}