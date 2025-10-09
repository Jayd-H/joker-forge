import { BoosterData, BoosterCardRule } from "../data/BalatroUtils";

export const generateBoostersCode = (
  boosters: BoosterData[],
  modPrefix: string
): { boostersCode: string } => {
  if (boosters.length === 0) {
    return { boostersCode: "" };
  }

  let code = "";

  boosters.forEach((booster, index) => {
    if (index > 0) code += "\n\n";
    code += generateSingleBooster(booster, modPrefix, index);
  });

  return { boostersCode: code };
};

const generateSingleBooster = (
  booster: BoosterData,
  modPrefix: string,
  index: number
): string => {
  const cleanKey = booster.objectKey || sanitizeKey(booster.name);

  let code = `SMODS.Booster {\n`;
  code += `    key = '${cleanKey}',\n`;

  code += `    loc_txt = {\n`;
  code += `        name = "${booster.name}",\n`;
  code += `        text = {\n`;

  const descriptionLines = booster.description
    .replace(/\[s\]/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  descriptionLines.forEach((line, lineIndex) => {
    const cleanLine = line.replace(/\{[^}]*\}/g, "").replace(/"/g, '\\"');
    code += `            "${cleanLine}"${
      lineIndex < descriptionLines.length - 1 ? "," : ""
    }\n`;
  });

  code += `        },\n`;

  const groupName = booster.group_key
    ? `"${booster.group_key}"`
    : `"${booster.name}"`;
  code += `        group_name = ${groupName}\n`;
  code += `    },\n`;

  code += `    config = { extra = ${booster.config.extra}, choose = ${booster.config.choose} },\n`;

  if (booster.cost !== undefined && booster.cost !== 4) {
    code += `    cost = ${booster.cost},\n`;
  }

  if (booster.weight !== undefined && booster.weight !== 1) {
    code += `    weight = ${booster.weight},\n`;
  }

  code += `    atlas = "CustomBoosters",\n`;

  const posX = index % 10;
  const posY = Math.floor(index / 10);
  code += `    pos = { x = ${posX}, y = ${posY} },\n`;

  if (booster.kind) {
    code += `    kind = '${booster.kind}',\n`;
  }

  if (booster.group_key) {
    code += `    group_key = "${booster.group_key}",\n`;
  }

  if (booster.draw_hand) {
    code += `    draw_hand = true,\n`;
  }

  if (booster.booster_type === "consumable" && booster.instant_use == false) {
    code += `    select_card = "consumeables",\n`;
  }

  if (booster.discovered === true) {
    code += `    discovered = true,\n`;
  }

  if (booster.hidden === true) {
    code += `    hidden = true,\n`;
  }

  code += `    loc_vars = function(self, info_queue, card)\n`;
  code += `        local cfg = (card and card.ability) or self.config\n`;
  code += `        return {\n`;
  code += `            vars = { cfg.choose, cfg.extra }\n`;
  code += `        }\n`;
  code += `    end,\n`;

  if (booster.card_rules && booster.card_rules.length > 0) {
    code += generateCreateCardFunction(booster, modPrefix);
  } else {
    code += generateDefaultCreateCardFunction(booster.booster_type);
  }

  if (booster.background_colour || booster.special_colour) {
    code += generateEaseBackgroundFunction(
      booster.background_colour,
      booster.special_colour
    );
  }

  code += generateParticlesFunction(booster.booster_type);

  code += `}\n`;

  return code;
};

const generateCreateCardFunction = (
  booster: BoosterData,
  modPrefix: string
): string => {
  const rules = booster.card_rules;
  if (!rules || rules.length === 0) {
    return generateDefaultCreateCardFunction(booster.booster_type);
  }

  let code = `    create_card = function(self, card, i)\n`;

  if (rules.length === 1) {
    const rule = rules[0];
    code += `        return {\n`;
    code += generateCardConfigFromRule(
      rule,
      booster.booster_type,
      "        ",
      modPrefix
    );
    code += `            area = G.pack_cards,\n`;
    code += `            skip_materialize = true,\n`;
    code += `            soulable = true,\n`;
    code += `            key_append = "${modPrefix}_${
      booster.objectKey || "booster"
    }"\n`;
    code += `        }\n`;
  } else {
    const hasWeights = rules.some((rule) => rule.weight && rule.weight !== 1);

    if (hasWeights) {
      code += `        local weights = {\n`;
      rules.forEach((rule, index) => {
        code += `            ${rule.weight || 1}${
          index < rules.length - 1 ? "," : ""
        }\n`;
      });
      code += `        }\n`;
      code += `        local total_weight = 0\n`;
      code += `        for _, weight in ipairs(weights) do\n`;
      code += `            total_weight = total_weight + weight\n`;
      code += `        end\n`;
      code += `        local random_value = pseudorandom('${modPrefix}_${
        booster.objectKey || "booster"
      }_card') * total_weight\n`;
      code += `        local cumulative_weight = 0\n`;
      code += `        local selected_index = 1\n`;
      code += `        for j, weight in ipairs(weights) do\n`;
      code += `            cumulative_weight = cumulative_weight + weight\n`;
      code += `            if random_value <= cumulative_weight then\n`;
      code += `                selected_index = j\n`;
      code += `                break\n`;
      code += `            end\n`;
      code += `        end\n`;
    } else {
      code += `        local selected_index = pseudorandom('${modPrefix}_${
        booster.objectKey || "booster"
      }_card', 1, ${rules.length})\n`;
    }

    rules.forEach((rule, index) => {
      const condition = index === 0 ? "if" : "elseif";
      code += `        ${condition} selected_index == ${index + 1} then\n`;
      code += `            return {\n`;
      code += generateCardConfigFromRule(
        rule,
        booster.booster_type,
        "            ",
        modPrefix
      );
      code += `                area = G.pack_cards,\n`;
      code += `                skip_materialize = true,\n`;
      code += `                soulable = true,\n`;
      code += `                key_append = "${modPrefix}_${
        booster.objectKey || "booster"
      }"\n`;
      code += `            }\n`;
    });
    code += `        end\n`;
  }

  code += `    end,\n`;
  return code;
};

const formatRarityForCode = (rarity: string, modPrefix: string): string => {
  if (!rarity || rarity === "" || rarity === "any") return "";

  if (["1", "2", "3", "4"].includes(rarity)) {
    const rarityMap: Record<string, string> = {
      "1": "Common",
      "2": "Uncommon",
      "3": "Rare",
      "4": "Legendary",
    };
    return rarityMap[rarity];
  }

  if (
    ["common", "uncommon", "rare", "legendary"].includes(rarity.toLowerCase())
  ) {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1).toLowerCase();
  }

  return `${modPrefix}_${rarity}`;
};

const generateCardConfigFromRule = (
  rule: BoosterCardRule,
  boosterType: string,
  indent: string = "        ",
  modPrefix: string = ""
): string => {
  let config = "";

  if (rule.specific_key) {
    config += `${indent}key = "${rule.specific_key}",\n`;
  }

  if (boosterType === "joker") {
    if (rule.pool && rule.pool.trim()) {
      const finalPool = modPrefix
        ? `${modPrefix}_${rule.pool.trim()}`
        : rule.pool.trim();
      config += `${indent}set = "${finalPool}",\n`;
    } else {
      config += `${indent}set = "Joker",\n`;
    }

    if (rule.rarity && rule.rarity !== "" && rule.rarity !== "any") {
      const formattedRarity = formatRarityForCode(rule.rarity, modPrefix);
      if (formattedRarity) {
        config += `${indent}rarity = "${formattedRarity}",\n`;
      }
    }
  } else if (boosterType === "playing_card") {
    config += `${indent}set = "Playing Card",\n`;

    if (rule.suit && rule.suit !== "" && rule.suit !== "any") {
      config += `${indent}suit = "${rule.suit}",\n`;
    }

    if (rule.rank && rule.rank !== "" && rule.rank !== "any") {
      config += `${indent}rank = "${rule.rank}",\n`;
    }

    if (
      rule.enhancement &&
      rule.enhancement !== "" &&
      rule.enhancement !== "any" &&
      rule.enhancement !== "none"
    ) {
      config += `${indent}enhancement = "${rule.enhancement}",\n`;
    }
  } else if (boosterType === "consumable") {
    const set = rule.set || "Tarot";
    config += `${indent}set = "${set}",\n`;
  }

  if (
    rule.edition &&
    rule.edition !== "" &&
    rule.edition !== "any" &&
    rule.edition !== "none"
  ) {
    config += `${indent}edition = "${rule.edition}",\n`;
  }

  if (
    rule.seal &&
    rule.seal !== "" &&
    rule.seal !== "any" &&
    rule.seal !== "none"
  ) {
    config += `${indent}seal = "${rule.seal}",\n`;
  }

  return config;
};

const generateDefaultCreateCardFunction = (boosterType: string): string => {
  let code = `    create_card = function(self, card, i)\n`;
  code += `        return {\n`;

  switch (boosterType) {
    case "joker":
      code += `            set = "Joker",\n`;
      break;
    case "playing_card":
      code += `            set = "Playing Card",\n`;
      break;
      case "voucher":
      code += `            set = "Voucher",\n`;
      break;
    case "consumable":
    default:
      code += `            set = "Tarot",\n`;
      break;
  }

  code += `            area = G.pack_cards,\n`;
  code += `            skip_materialize = true,\n`;
  code += `            soulable = true\n`;
  code += `        }\n`;
  code += `    end,\n`;

  return code;
};

const generateEaseBackgroundFunction = (
  backgroundColor?: string,
  specialColor?: string
): string => {
  if (!backgroundColor && !specialColor) return "";

  let code = `    ease_background_colour = function(self)\n`;

  if (backgroundColor && specialColor) {
    const bgHex = backgroundColor.startsWith("#")
      ? backgroundColor.slice(1)
      : backgroundColor;
    const specialHex = specialColor.startsWith("#")
      ? specialColor.slice(1)
      : specialColor;
    code += `        ease_colour(G.C.DYN_UI.MAIN, HEX("${bgHex}"))\n`;
    code += `        ease_background_colour({ new_colour = HEX('${bgHex}'), special_colour = HEX("${specialHex}"), contrast = 2 })\n`;
  } else if (backgroundColor) {
    const bgHex = backgroundColor.startsWith("#")
      ? backgroundColor.slice(1)
      : backgroundColor;
    code += `        ease_background_colour({ new_colour = HEX('${bgHex}') })\n`;
  }

  code += `    end,\n`;
  return code;
};

const generateParticlesFunction = (boosterType: string): string => {
  let code = `    particles = function(self)\n`;

  switch (boosterType) {
    case "joker":
      code += `        -- No particles for joker packs\n`;
      break;
    case "consumable":
      code += `        G.booster_pack_sparkles = Particles(1, 1, 0, 0, {\n`;
      code += `            timer = 0.015,\n`;
      code += `            scale = 0.2,\n`;
      code += `            initialize = true,\n`;
      code += `            lifespan = 1,\n`;
      code += `            speed = 1.1,\n`;
      code += `            padding = -1,\n`;
      code += `            attach = G.ROOM_ATTACH,\n`;
      code += `            colours = { G.C.WHITE, lighten(G.C.PURPLE, 0.4), lighten(G.C.PURPLE, 0.2), lighten(G.C.GOLD, 0.2) },\n`;
      code += `            fill = true\n`;
      code += `        })\n`;
      code += `        G.booster_pack_sparkles.fade_alpha = 1\n`;
      code += `        G.booster_pack_sparkles:fade(1, 0)\n`;
      break;
    case "playing_card":
    default:
      code += `        G.booster_pack_sparkles = Particles(1, 1, 0, 0, {\n`;
      code += `            timer = 0.015,\n`;
      code += `            scale = 0.3,\n`;
      code += `            initialize = true,\n`;
      code += `            lifespan = 3,\n`;
      code += `            speed = 0.2,\n`;
      code += `            padding = -1,\n`;
      code += `            attach = G.ROOM_ATTACH,\n`;
      code += `            colours = { G.C.BLACK, G.C.RED },\n`;
      code += `            fill = true\n`;
      code += `        })\n`;
      code += `        G.booster_pack_sparkles.fade_alpha = 1\n`;
      code += `        G.booster_pack_sparkles:fade(1, 0)\n`;
      break;
      case "voucher":
      code += `        -- No particles for voucher packs\n`;
      break;
  }

  code += `    end,\n`;
  return code;
};

const sanitizeKey = (name: string): string => {
  return (
    name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .replace(/^[0-9]+/, "") || "custom_booster"
  );
};
