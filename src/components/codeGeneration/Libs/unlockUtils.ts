import {
  VoucherData,
  EDITIONS,
  ENHANCEMENTS,
  POKER_HANDS,
  RANKS,
  SEALS,
  STICKERS,
  SUITS,
  VOUCHERS,
  JokerData,
  getRarityDropdownOptions,
} from "../../data/BalatroUtils";

export const unlockTriggerOptions = [
  { value: "hand_contents", label: "Cards Played" },
  { value: "modify_deck", label: "Cards In Deck" },
  { value: "career_stat", label: "Career Stat" },
  { value: "discard_custom", label: "Discard Hand" },
  { value: "win", label: "Win a Run" },
  { value: "round_win", label: "Win a Round" },
  { value: "chip_score", label: "Scored in one Hand" },
];

// CARDS
export const rankOptions = [
  ...RANKS.map(({ id, label }) => ({ value: id.toString(), label })),
];
export const suitOptions = [
  ...SUITS.map(({ value, label }) => ({ value, label })),
];

export const enhancementOptions = [
  { value: "any", label: "Any Enhancement" },
  ...ENHANCEMENTS().map(({ key, label }) => ({ value: key, label })),
];

export const sealOptions = [
  { value: "any", label: "Any Seal" },
  ...SEALS().map(({ key, label }) => ({ value: key, label })),
];

export const voucherOptions = [
  { value: "any", label: "Any Voucher" },
  ...VOUCHERS().map(({ key, label }) => ({ value: key, label })),
];

export const editionOptions = [
  { value: "any", label: "Any Edition" },
  ...EDITIONS().map(({ key, label }) => ({ value: key, label })),
];

export const stickerOptions = [
  ...STICKERS.map(({ value, label }) => ({ value, label })),
];

// CAREER STATS
export const cardStatsOptions = [
  { value: "c_hands_played", label: "Hands Played" },
  { value: "c_cards_played", label: "Cards Played" },
  { value: "c_face_cards_played", label: "Face Cards Played" },
  { value: "c_cards_discarded", label: "Cards Discarded" },
  { value: "c_playing_cards_bought", label: "Playing Cards Bought" },
  { value: "c_cards_sold", label: "Cards Sold" },
];

export const consumableStatsOptions = [
  { value: "c_planets_bought", label: "Planets Bought" },
  { value: "c_planetarium_used", label: "Planets Used" },
  { value: "c_tarot_bought", label: "Tarot Bought" },
  { value: "c_tarot_reading_used", label: "Tarot Used" },
];

export const economyStatsOptions = [
  { value: "c_dollars_earned", label: "Money Earned" },
  { value: "c_vouchers_bought", label: "Vouchers Bought" },
  { value: "c_shop_rerolls", label: "Shop Rerolls" },
  { value: "c_shop_dollars_spent", label: "Money Spent" },
  { value: "c_round_interest_cap_streak", label: "Interest Cap Streak" },
];

export const runStatsOptions = [
  { value: "c_rounds", label: "Rounds" },
  { value: "c_wins", label: "Wins" },
  { value: "c_losses", label: "Losses" },
  { value: "c_single_hand_round_streak", label: "Round in one Hand Streak" },
];

// WIN RUN
export const pokerHandOptions = [
  ...POKER_HANDS.map(({ value, label }) => ({ value, label })),
];

export const vouchersOptions = [
  { value: "voucher_count", label: "Vouchers Owned" },
  { value: "voucher_slots", label: "Voucher Slots" },
];

export const blindsOptions = [
  { value: "round", label: "Rounds" },
  { value: "ante", label: "Current Ante" },
  { value: "skips", label: "Blinds Skipped" },
  { value: "boss", label: "Boss Beaten" },
];

export const resourcesOptions = [
  { value: "hands", label: "Remaining Hands" },
  { value: "discards", label: "Remaining Discards" },
  { value: "dollars", label: "Current Money" },
];

export const jokersOptions = [
  { value: "max_jokers", label: "Max Jokers Owned" },
  { value: "joker_count", label: "Jokers Owned" },
  { value: "joker_slots", label: "Joker Slots" },
];

export const jokerUnlockOptions = {
  hand_contents: {
    categories: [
      { value: "rank", label: "Rank", options: rankOptions },
      { value: "suit", label: "Suit", options: suitOptions },
      {
        value: "enhancement",
        label: "Enhancement",
        options: enhancementOptions,
      },
      { value: "seal", label: "Seal", options: sealOptions },
      { value: "edition", label: "Edition", options: editionOptions },
      { value: "poker_hand", label: "Poker Hand", options: pokerHandOptions },
    ],
  },
  modify_deck: {
    categories: [
      { value: "rank", label: "Rank", options: rankOptions },
      { value: "suit", label: "Suit", options: suitOptions },
      {
        value: "enhancement",
        label: "Enhancement",
        options: enhancementOptions,
      },
      { value: "seal", label: "Seal", options: sealOptions },
      { value: "edition", label: "Edition", options: editionOptions },
    ],
  },
  modify_jokers: {
    categories: [
      { value: "rarity", label: "Rarity", options: getRarityDropdownOptions() },
      { value: "edition", label: "Edition", options: editionOptions },
      { value: "sticker", label: "Sticker", options: stickerOptions },
    ],
  },
  career_stat: {
    categories: [
      { value: "card_stats", label: "Cards", options: cardStatsOptions },
      {
        value: "consumable_stats",
        label: "Consumables",
        options: consumableStatsOptions,
      },
      {
        value: "economy_stats",
        label: "Economy",
        options: economyStatsOptions,
      },
      { value: "run_stats", label: "Runs", options: runStatsOptions },
    ],
  },
  discard_custom: {
    categories: [
      { value: "rank", label: "Rank", options: rankOptions },
      { value: "suit", label: "Suit", options: suitOptions },
      {
        value: "enhancement",
        label: "Enhancement",
        options: enhancementOptions,
      },
      { value: "seal", label: "Seal", options: sealOptions },
      { value: "edition", label: "Edition", options: editionOptions },
      { value: "poker_hand", label: "Poker Hand", options: pokerHandOptions },
    ],
  },
  // There are a lot of possible options for win run/round, we can add them in the future as needed
  win: {
    categories: [
      { value: "jokers", label: "Jokers", options: jokersOptions },
      {
        value: "played_hand",
        label: "Hand has been Played",
        options: pokerHandOptions,
      },
      {
        value: "not_played_hand",
        label: "Hand has not been Played",
        options: pokerHandOptions,
      },
      {
        value: "last_played_hand",
        label: "Last Played Hand",
        options: pokerHandOptions,
      },
      { value: "blinds", label: "Blinds", options: blindsOptions },
      {
        value: "resources",
        label: "Player Resources",
        options: resourcesOptions,
      },
    ],
  },
  round_win: {
    categories: [
      { value: "jokers", label: "Jokers", options: jokersOptions },
      {
        value: "played_hand",
        label: "Hand has been Played",
        options: pokerHandOptions,
      },
      {
        value: "not_played_hand",
        label: "Hand has not been Played",
        options: pokerHandOptions,
      },
      {
        value: "last_played_hand",
        label: "Last Played Hand",
        options: pokerHandOptions,
      },
      { value: "blinds", label: "Blinds", options: blindsOptions },
      {
        value: "resources",
        label: "Player Resources",
        options: resourcesOptions,
      },
    ],
  },
  chip_score: {
    categories: [],
  },
};


export const vouchersunlockOptions = {
  hand_contents: {
    categories: [
      { value: "rank", label: "Rank", options: rankOptions },
      { value: "suit", label: "Suit", options: suitOptions },
      {
        value: "enhancement",
        label: "Enhancement",
        options: enhancementOptions,
      },
      { value: "seal", label: "Seal", options: sealOptions },
      { value: "edition", label: "Edition", options: editionOptions },
      { value: "poker_hand", label: "Poker Hand", options: pokerHandOptions },
    ],
  },
  modify_deck: {
    categories: [
      { value: "rank", label: "Rank", options: rankOptions },
      { value: "suit", label: "Suit", options: suitOptions },
      {
        value: "enhancement",
        label: "Enhancement",
        options: enhancementOptions,
      },
      { value: "seal", label: "Seal", options: sealOptions },
      { value: "edition", label: "Edition", options: editionOptions },
    ],
  },
  career_stat: {
    categories: [
      { value: "card_stats", label: "Cards", options: cardStatsOptions },
      {
        value: "consumable_stats",
        label: "Consumables",
        options: consumableStatsOptions,
      },
      {
        value: "economy_stats",
        label: "Economy",
        options: economyStatsOptions,
      },
      { value: "run_stats", label: "Runs", options: runStatsOptions },
    ],
  },
  discard_custom: {
    categories: [
      { value: "rank", label: "Rank", options: rankOptions },
      { value: "suit", label: "Suit", options: suitOptions },
      {
        value: "enhancement",
        label: "Enhancement",
        options: enhancementOptions,
      },
      { value: "seal", label: "Seal", options: sealOptions },
      { value: "edition", label: "Edition", options: editionOptions },
      { value: "poker_hand", label: "Poker Hand", options: pokerHandOptions },
    ],
  },
  // There are a lot of possible options for win run/round, we can add them in the future as needed
  win: {
    categories: [
      { value: "vouchers", label: "Vouchers", options: vouchersOptions },
      {
        value: "played_hand",
        label: "Hand has been Played",
        options: pokerHandOptions,
      },
      {
        value: "not_played_hand",
        label: "Hand has not been Played",
        options: pokerHandOptions,
      },
      {
        value: "last_played_hand",
        label: "Last Played Hand",
        options: pokerHandOptions,
      },
      { value: "blinds", label: "Blinds", options: blindsOptions },
      {
        value: "resources",
        label: "Player Resources",
        options: resourcesOptions,
      },
    ],
  },
  round_win: {
    categories: [
      {
        value: "played_hand",
        label: "Hand has been Played",
        options: pokerHandOptions,
      },
      {
        value: "not_played_hand",
        label: "Hand has not been Played",
        options: pokerHandOptions,
      },
      {
        value: "last_played_hand",
        label: "Last Played Hand",
        options: pokerHandOptions,
      },
      { value: "blinds", label: "Blinds", options: blindsOptions },
      {
        value: "resources",
        label: "Player Resources",
        options: resourcesOptions,
      },
    ],
  },
  chip_score: {
    categories: [],
  },
};

const propertyConditionGenerators: Record<
  string,
  (property: string, targetCard: string, comparison?: string) => string
> = {
  // CARDS
  rank: (property, target) => `${target}:get_id() == ${property}`,
  suit: (property, target) => `${target}:is_suit("${property}")`,
  enhancement: (property, target) =>
    property === "any"
      ? `SMODS.get_enhancements(${target})`
      : `SMODS.has_enhancement(${target}, "${property}")`,
  seal: (property, target) =>
    property === "any"
      ? `${target}.seal ~= nil`
      : `${target}.seal == "${property}"`,
  voucher: (property, target) =>
    property === "any"
      ? `${target}.voucher ~= nil`
      : `${target}.voucher == "${property}"`,
  edition: (property, target) =>
    property === "any"
      ? `${target}.edition ~= nil`
      : `${target}.edition and ${target}.edition.key == "${property}"`,
  sticker: (property, target) => `${target}.ability.${property}`,
  rarity: (property, target) => `${target}.config.center.rarity == ${property}`,
  poker_hand: (property) =>
    `next(evaluate_poker_hand(args.cards)["${property}"])`,

  // WIN RUN/ROUND
  played_hand: (property, _, comparison) =>
    `G.GAME.hands["${property}"].played ${comparison}`,
  not_played_hand: (property) => `G.GAME.hands["${property}"].played == 0`,
  last_played_hand: (property) => `G.GAME.last_hand_played == "${property}"`,
  vouchers: (property, _, comparison) => {
    if (property === "voucher_count")
      return `#(G.vouchers and G.vouchers.cards or {}) ${comparison}`;
    if (property === "joker_slots")
      return `(G.vouchers and G.vouchers.config.card_limit or 0) ${comparison}`;
    if (property === "max_vouchers") return `G.GAME.max_vouchers ${comparison}`;
    return "true";
  },
  blinds: (property, _, comparison) => {
    if (property === "boss") return `G.GAME.blind.boss`;
    if (property === "ante") return `args.ante ${comparison}`;
    return `G.GAME.${property} ${comparison}`;
  },
  resources: (property, _, comparison) => {
    if (property === "hands" || property === "discards")
      return `G.GAME.current_round.${property}_left ${comparison}`;
    return `G.GAME.${property} ${comparison}`;
  },
};

const generatePropertyConditions = (
  unlockProperties?: Array<{ category: string; property: string }>,
  targetCard?: string,
  comparison?: string
): string[] | undefined =>
  unlockProperties?.map(({ category, property }) => {
    const generator = propertyConditionGenerators[category];
    return generator
      ? generator(property, targetCard ?? "", comparison)
      : "true";
  }
);

export const generateUnlockJokerFunction = (jokerData: JokerData) => {
  const unlockTrigger = jokerData.unlockTrigger;
  const unlockProperties = jokerData.unlockProperties;
  const unlockOperator = jokerData.unlockOperator;
  const unlockCount = jokerData.unlockCount ?? 1;

  let comparison = "";
  switch (unlockOperator) {
    case "equals":
      comparison = `== to_big(${unlockCount})`;
      break;
    case "greater_than":
      comparison = `> to_big(${unlockCount})`;
      break;
    case "less_than":
      comparison = `< to_big(${unlockCount})`;
      break;
    case "greater_equals":
      comparison = `>= to_big(${unlockCount})`;
      break;
    case "less_equals":
      comparison = `<= to_big(${unlockCount})`;
      break;
    default:
      comparison = `== to_big(${unlockCount})`;
  }

  let unlockFunction = `,
  check_for_unlock = function(self,args)
    if args.type == "${String(unlockTrigger)}" then
      local count = 0`;

  if (unlockTrigger === "chip_score") {
    unlockFunction += `\n return args.chips ${comparison}`;
  } else if (unlockTrigger === "career_stat") {
    unlockFunction += `\n return G.PROFILES[G.SETTINGS.profile].career_stats.${unlockProperties?.[0].property} ${comparison}`;
  } else if (unlockTrigger === "win" || unlockTrigger === "round_win") {
    const conditions = generatePropertyConditions(
      unlockProperties,
      "",
      comparison
    )?.join(" and ");

    unlockFunction += `\n return ${conditions}`;
  } else if (
    unlockTrigger === "hand_contents" ||
    unlockTrigger === "modify_deck" ||
    unlockTrigger === "modify_jokers" ||
    unlockTrigger === "discard_custom"
  ) {
    let targetCard = "";

    switch (unlockTrigger) {
      case "discard_custom":
      case "hand_contents":
        unlockFunction += `
        for i = 1, #args.cards do`;
        targetCard = `args.cards[i]`;
        break;

      case "modify_deck":
        unlockFunction += `
        if deck_initialized == nil then
          local deck_initialized = false
        end

        if not deck_initialized and #G.playing_cards >= 40 then
          deck_initialized = true
        end

        if not deck_initialized then
          return false
        end

        for _, card in ipairs(G.playing_cards or {}) do`;
        targetCard = `card`;
        break;

      case "modify_jokers":
        unlockFunction += `
        for _, joker in ipairs(G.jokers.cards) do`;
        targetCard = `joker`;
        break;
    }

    const conditions = generatePropertyConditions(
      unlockProperties,
      targetCard
    )?.join(" and ");

    unlockFunction += `
    if ${conditions?.length ? conditions : "true"} then
      count = count + 1
    end
    end
      if count ${comparison} then
        return true
      end`;
  }

  unlockFunction += `
  end
  return false
  end`;

  return unlockFunction;
};

export const generateUnlockVoucherFunction = (voucherData: VoucherData) => {
  const unlockTrigger = voucherData.unlockTrigger;
  const unlockProperties = voucherData.unlockProperties;
  const unlockOperator = voucherData.unlockOperator;
  const unlockCount = voucherData.unlockCount ?? 1;

  let comparison = "";
  switch (unlockOperator) {
    case "equals":
      comparison = `== to_big(${unlockCount})`;
      break;
    case "greater_than":
      comparison = `> to_big(${unlockCount})`;
      break;
    case "less_than":
      comparison = `< to_big(${unlockCount})`;
      break;
    case "greater_equals":
      comparison = `>= to_big(${unlockCount})`;
      break;
    case "less_equals":
      comparison = `<= to_big(${unlockCount})`;
      break;
    default:
      comparison = `== to_big(${unlockCount})`;
  }

  let unlockFunction = `,
  check_for_unlock = function(self,args)
    if args.type == "${String(unlockTrigger)}" then
      local count = 0`;

  if (unlockTrigger === "chip_score") {
    unlockFunction += `\n return args.chips ${comparison}`;
  } else if (unlockTrigger === "career_stat") {
    unlockFunction += `\n return G.PROFILES[G.SETTINGS.profile].career_stats.${unlockProperties?.[0].property} ${comparison}`;
  } else if (unlockTrigger === "win" || unlockTrigger === "round_win") {
    const conditions = generatePropertyConditions(
      unlockProperties,
      "",
      comparison
    )?.join(" and ");

    unlockFunction += `\n return ${conditions}`;
  } else if (
    unlockTrigger === "hand_contents" ||
    unlockTrigger === "modify_deck" ||
    unlockTrigger === "discard_custom"
  ) {
    let targetCard = "";

    switch (unlockTrigger) {
      case "discard_custom":
      case "hand_contents":
        unlockFunction += `
        for i = 1, #args.cards do`;
        targetCard = `args.cards[i]`;
        break;

      case "modify_deck":
        unlockFunction += `
        if deck_initialized == nil then
          local deck_initialized = false
        end

        if not deck_initialized and #G.playing_cards >= 40 then
          deck_initialized = true
        end

        if not deck_initialized then
          return false
        end

        for _, card in ipairs(G.playing_cards or {}) do`;
        targetCard = `card`;
        break;
    }

    const conditions = generatePropertyConditions(
      unlockProperties,
      targetCard
    )?.join(" and ");

    unlockFunction += `
    if ${conditions?.length ? conditions : "true"} then
      count = count + 1
    end
    end
      if count ${comparison} then
        return true
      end`;
  }

  unlockFunction += `
  end
  return false
  end`;

  return unlockFunction;
};
