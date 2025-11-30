import { EDITIONS, getModPrefix } from "../../data/BalatroUtils";
import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";

export const generateCreateJokerEffectCode = (
  effect: Effect,
  itemType: string,
  triggerType: string
): EffectReturn => {
  const modPrefix = getModPrefix()
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect, triggerType, modPrefix)
    case "consumable":
      return generateConsumableCode(effect, modPrefix)
    case "card":
      return generateCardCode(effect, modPrefix)
    case "deck":
      return generateDeckCode(effect, modPrefix)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateJokerCode = (
  effect: Effect,
  triggerType: string,
  modPrefix?: string
): EffectReturn => {
 const jokerType = (effect.params?.joker_type?.value as string) || "random";
  const rarity = (effect.params?.rarity?.value as string) || "random";
  const jokerKey = (effect.params?.joker_key?.value as string) || "";
  const pool = (effect.params?.pool?.value as string) || "";
  const edition = (effect.params?.edition?.value as string) || "none";
  const customMessage = effect.customMessage;
  const sticker = (effect.params?.sticker?.value as string) || "none";
  const ignoreSlots = (effect.params?.ignore_slots?.value as string) === "y";

  const isEditionVar = !EDITIONS().map(edition => edition?.value).includes(edition) && edition !== "none"

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);
  const isNegative = edition === "e_negative";
  const hasSticker = sticker !== "none";

  const normalizedJokerKey = jokerKey.startsWith("j_")
    ? jokerKey
    : `j_${jokerKey}`;

  const cardParams = [];

  if (pool && pool.trim()) {
    const finalPool = modPrefix ? `${modPrefix}_${pool.trim()}` : pool.trim();
    cardParams.push(`set = '${finalPool}'`);
  } else {
    cardParams.push(`set = 'Joker'`);
  }

 if (jokerType !== "random" && jokerType !== "pool") {
    if ((jokerType === "specific" && normalizedJokerKey)) {
      cardParams.push(`key = '${normalizedJokerKey}'`);
    } else if (jokerType === "selected_joker") {
      cardParams.push(`key =  G.jokers.highlighted[1].key`);
    }
    else if (jokerType === "evaled_joker") {
      cardParams.push(`key = context.other_joker.config.center.key`);
    } else {
      cardParams.push(`key = card.ability.extra.${jokerType}`);
    }
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
      : modPrefix
      ? `${modPrefix}_${rarity}`
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
    isEditionVar ? `joker_card:set_edition(card.ability.extra.${edition}, true)` : 
    edition !== "none" ? `joker_card:set_edition("${edition.startsWith("e_") ? edition : `e_${edition}`}", true)` : ``;

  const stickerCode = hasSticker
    ? `joker_card:add_sticker('${sticker}', true)`
    : "";

  const creationCode = `
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
            ${!(isNegative || ignoreSlots) ? "end" : ""}`

  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__
                 ${creationCode}
                __PRE_RETURN_CODE_END__`,
      message: customMessage
        ? `"${customMessage}"`
        : `created_joker and localize('k_plus_joker') or nil`,
      colour: "G.C.BLUE",
    };
  } else {
    return {
      statement: `func = function()
                ${creationCode}
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

const generateConsumableCode = (
  effect: Effect,
  modPrefix?: string,
): EffectReturn => {
  const jokerType = (effect.params?.joker_type?.value as string) || "random";
  const rarity = (effect.params?.rarity?.value as string) || "random";
  const jokerKey = (effect.params?.joker_key?.value as string) || "";
  const pool = (effect.params?.pool?.value as string) || "";
  const edition = (effect.params?.edition?.value as string) || "none";
  const sticker = (effect.params?.sticker?.value as string) || "none";
  const ignoreSlotsParam = (effect.params?.ignore_slots?.value as string) || "respect";
  const customMessage = effect.customMessage;

  const isNegative = edition === "e_negative";
  const hasSticker = sticker !== "none";
  const ignoreSlots = ignoreSlotsParam === "ignore";

  const normalizedJokerKey = jokerKey.startsWith("j_")
    ? jokerKey
    : `j_${jokerKey}`;

  // Build SMODS.add_card parameters
  const cardParams = [];

  if (pool && pool.trim()) {
    const finalPool = modPrefix ? `${modPrefix}_${pool.trim()}` : pool.trim();
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
      : modPrefix
      ? `${modPrefix}_${rarity}`
      : rarity;
    cardParams.push(`rarity = '${finalRarity}'`);
  }

  // Build the creation code
  const lines: string[] = [
    "G.E_MANAGER:add_event(Event({",
    "    trigger = 'after',",
    "    delay = 0.4,",
    "    func = function()",
    "        play_sound('timpani')",
  ];

  // Handle slot limits
  if (!(isNegative || ignoreSlots)) {
    lines.push(
      "        if #G.jokers.cards + G.GAME.joker_buffer < G.jokers.config.card_limit then",
      "            G.GAME.joker_buffer = G.GAME.joker_buffer + 1"
    );
  }

  // Card creation
  lines.push(
    `        local new_joker = SMODS.add_card({ ${cardParams.join(", ")} })`
  );
  lines.push("        if new_joker then");

  if (edition !== "none") {
    lines.push(`            new_joker:set_edition("${edition.startsWith("e_") ? edition : `e_${edition}`}", true)`);
  }

  if (hasSticker) {
    lines.push(`            new_joker:add_sticker('${sticker}', true)`);
  }

  lines.push("        end");

  // Close slot limit check
  if (!(isNegative || ignoreSlots)) {
    lines.push("            G.GAME.joker_buffer = 0", "        end");
  }

  lines.push(
    "        used_card:juice_up(0.3, 0.5)",
    "        return true",
    "    end",
    "}))",
    "delay(0.6)"
  );

  const createJokerCode = lines.join("\n              ");

  const result: EffectReturn = {
    statement: `__PRE_RETURN_CODE__
              ${createJokerCode}
              __PRE_RETURN_CODE_END__`,
    colour: "G.C.SECONDARY_SET.Tarot",
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};

const generateCardCode = (
  effect: Effect,
  modPrefix?: string,
): EffectReturn => {
  const jokerType = (effect.params?.joker_type?.value as string) || "random";
  const rarity = (effect.params?.rarity?.value as string) || "random";
  const jokerKey = (effect.params?.joker_key?.value as string) || "";
  const pool = (effect.params?.pool?.value as string) || "";
  const edition = (effect.params?.edition?.value as string) || "none";
  const sticker = (effect.params?.sticker?.value as string) || "none";
  const ignoreSlotsParam = (effect.params?.ignore_slots?.value as string) || "respect";
  const customMessage = effect.customMessage;

  const isNegative = edition === "e_negative";
  const hasSticker = sticker !== "none";
  const ignoreSlots = ignoreSlotsParam === "ignore";

  const normalizedJokerKey = jokerKey.startsWith("j_")
    ? jokerKey
    : `j_${jokerKey}`;

  const cardParams = [];

  if (pool && pool.trim()) {
    const finalPool = modPrefix ? `${modPrefix}_${pool.trim()}` : pool.trim();
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
      : modPrefix
      ? `${modPrefix}_${rarity}`
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
    edition !== "none" ? `joker_card:set_edition("${edition.startsWith("e_") ? edition : `e_${edition}`}", true)` : "";
  const stickerCode = hasSticker
    ? `joker_card:add_sticker('${sticker}', true)`
    : "";

  const result: EffectReturn = {
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

  return result;
};

const generateDeckCode = (
  effect: Effect,
  modPrefix?: string,
): EffectReturn => {
  const jokerType = (effect.params?.joker_type?.value as string) || "random";
  const rarity = (effect.params?.rarity?.value as string) || "random";
  const jokerKey = (effect.params?.joker_key?.value as string) || "";
  const pool = (effect.params?.pool?.value as string) || "";
  const edition = (effect.params?.edition?.value as string) || "none";
  const sticker = (effect.params?.sticker?.value as string) || "none";
  const ignoreSlotsParam = (effect.params?.ignore_slots?.value as string) || "respect";

  const isNegative = edition === "e_negative";
  const hasSticker = sticker !== "none";
  const ignoreSlots = ignoreSlotsParam === "ignore";

  const normalizedJokerKey = jokerKey.startsWith("j_")
    ? jokerKey
    : `j_${jokerKey}`;

  // Build SMODS.add_card parameters
  const cardParams = [];

  if (pool && pool.trim()) {
    const finalPool = modPrefix ? `${modPrefix}_${pool.trim()}` : pool.trim();
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
      : modPrefix
      ? `${modPrefix}_${rarity}`
      : rarity;
    cardParams.push(`rarity = '${finalRarity}'`);
  }

  // Build the creation code
  const lines: string[] = [
    "G.E_MANAGER:add_event(Event({",
    "    func = function()",
    "        play_sound('timpani')",
  ];

  // Handle slot limits
  if (!(isNegative || ignoreSlots)) {
    lines.push(
      "        if #G.jokers.cards + G.GAME.joker_buffer < G.jokers.config.card_limit then",
      "            G.GAME.joker_buffer = G.GAME.joker_buffer + 1"
    );
  }

  // Card creation
  lines.push(
    `        local new_joker = SMODS.add_card({ ${cardParams.join(", ")} })`
  );
  lines.push("        if new_joker then");

  if (edition !== "none") {
    lines.push(`            new_joker:set_edition("${edition.startsWith("e_") ? edition : `e_${edition}`}", true)`);
  }

  if (hasSticker) {
    lines.push(`            new_joker:add_sticker('${sticker}', true)`);
  }

  lines.push("        end");

  // Close slot limit check
  if (!(isNegative || ignoreSlots)) {
    lines.push("            G.GAME.joker_buffer = 0", "        end");
  }

  lines.push(
    "        return true",
    "    end",
    "}))",
  );

  const createJokerCode = lines.join("\n              ");

  const result: EffectReturn = {
    statement: `__PRE_RETURN_CODE__
              ${createJokerCode}
              __PRE_RETURN_CODE_END__`,
    colour: "G.C.SECONDARY_SET.Tarot",
  };

  return result;
};