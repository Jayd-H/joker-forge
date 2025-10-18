import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateCreateJokerReturn = (
  effect: Effect,
  modprefix: string
): EffectReturn => {
  const jokerType = (effect.params?.joker_type as string) || "random";
  const rarity = (effect.params?.rarity as string) || "random";
  const jokerKey = (effect.params?.joker_key as string) || "";
  const pool = (effect.params?.pool as string) || "";
  const edition = (effect.params?.edition as string) || "none";
  const sticker = (effect.params?.sticker as string) || "none";
  const ignoreSlotsParam = (effect.params?.ignore_slots as string) || "respect";

  const isNegative = edition === "e_negative";
  const hasSticker = sticker !== "none";
  const ignoreSlots = ignoreSlotsParam === "ignore";

  const normalizedJokerKey = jokerKey.startsWith("j_")
    ? jokerKey
    : `j_${jokerKey}`;

  // Build SMODS.add_card parameters
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

  // Build the creation code
  const lines: string[] = [
    "G.E_MANAGER:add_event(Event({",
    "    func = function()",
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
    lines.push(`            new_joker:set_edition("${edition}", true)`);
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
